import { FunctionImpl, GroupImpl } from "@confect/server";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import { daysOverdue } from "../shared/domain/loanView";
import { reminderKey, type OverdueReminder } from "../shared/integration/automation";
import automation from "./automation.spec";
import databaseSchema from "./_generated/schema";
import { DatabaseReader, DocumentIds } from "./_generated/services";
import type { Id } from "./_generated/id";
import { recordAutomationEvent } from "./lib/automationEvents";
import { loadTool, loadUser } from "./policies/load";

const OVERDUE_LIMIT = 200;
const sentKey = (key: string) => `reminder:${key}:sent`;

const hasEvent = (idempotencyKey: string) =>
  Effect.flatMap(DatabaseReader, (reader) =>
    reader
      .table("automationEvents")
      .index("by_idempotencyKey", (q) => q.eq("idempotencyKey", idempotencyKey))
      .first(),
  ).pipe(Effect.map(Option.isSome), Effect.orDie);

/**
 * Convex decides who gets a reminder: approved loans past their end date,
 * borrower still active, and not already reminded today.
 */
const overdueLoans = FunctionImpl.make(
  databaseSchema,
  automation,
  "overdueLoans",
  ({ today }) =>
    Effect.gen(function* () {
      const reader = yield* DatabaseReader;
      const loans = yield* reader
        .table("loans")
        .index("by_status_endDate", (q) =>
          q.eq("status", "approved").lt("endDate", today),
        )
        .take(OVERDUE_LIMIT);

      const reminders = yield* Effect.forEach(loans, (loan) =>
        Effect.gen(function* () {
          const key = reminderKey(loan._id, today);
          if (yield* hasEvent(sentKey(key))) return [];
          const borrower = yield* loadUser(loan.borrowerId);
          if (borrower.anonymizedAt !== undefined) return [];
          const tool = yield* loadTool(loan.toolId);
          const reminder: OverdueReminder = {
            reminderKey: key,
            loanId: loan._id,
            recipient: { email: borrower.email, firstName: borrower.firstName },
            tool: { name: tool.name },
            loan: { startDate: loan.startDate, endDate: loan.endDate },
            daysOverdue: daysOverdue(loan, today),
          };
          return [reminder];
        }),
      );
      return { date: today, reminders: reminders.flat() };
    }).pipe(Effect.orDie),
);

/** Idempotent per key and status, so n8n retries are harmless. */
const recordReminder = FunctionImpl.make(
  databaseSchema,
  automation,
  "recordReminder",
  ({ reminderKey: key, status, detail }) =>
    Effect.gen(function* () {
      const ids = yield* DocumentIds;
      const [rawLoanId = ""] = key.split(":");
      // Validates the id against the loans table; a foreign id is just dropped.
      const loanId = yield* ids.parse("loans", rawLoanId);
      const event = {
        idempotencyKey: `reminder:${key}:${status}`,
        kind:
          status === "sent" ? ("reminder_sent" as const) : ("reminder_failed" as const),
        ...(detail === undefined ? {} : { detail }),
      };
      return yield* recordAutomationEvent(
        Option.match(loanId, {
          onNone: () => event,
          onSome: (id: Id<"loans">) => ({ ...event, loanId: id }),
        }),
      );
    }),
);

const recordWorkflowError = FunctionImpl.make(
  databaseSchema,
  automation,
  "recordWorkflowError",
  ({ executionId, workflow, node, message }) =>
    recordAutomationEvent({
      idempotencyKey: `error:${executionId}`,
      kind: "workflow_error",
      detail: `${workflow}${node === undefined ? "" : ` › ${node}`}: ${message}`.slice(
        0,
        500,
      ),
    }),
);

export default GroupImpl.make(databaseSchema, automation).pipe(
  Layer.provide(overdueLoans),
  Layer.provide(recordReminder),
  Layer.provide(recordWorkflowError),
  GroupImpl.finalize,
);
