import * as Clock from "effect/Clock";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import {
  NotificationPayload,
  type NotificationType,
} from "../../shared/integration/events";
import refs from "../_generated/refs";
import { DatabaseWriter, Scheduler } from "../_generated/services";
import type loans from "../_generated/tables/loans";
import { loadTool, loadUser } from "../policies/load";

export type Recipient = "lender" | "borrower";

const validatePayload = Schema.decodeUnknownSync(NotificationPayload);

/**
 * Writes the notification to the outbox in the caller's transaction, so it is
 * committed if and only if the state change is, then schedules delivery.
 * `loan` must already carry its new status.
 */
export const enqueueNotification = Effect.fn("Outbox.enqueue")(function* (
  loan: typeof loans.Doc.Type,
  type: NotificationType,
  recipient: Recipient,
) {
  const writer = yield* DatabaseWriter;
  const scheduler = yield* Scheduler;

  const user = yield* loadUser(
    recipient === "lender" ? loan.lenderId : loan.borrowerId,
  ).pipe(Effect.orDie);
  if (user.anonymizedAt !== undefined) return; // Nobody left to notify.
  const tool = yield* loadTool(loan.toolId).pipe(Effect.orDie);

  // Data minimization: only what the email template needs.
  const payload = validatePayload({
    eventId: crypto.randomUUID(),
    type,
    recipient: { email: user.email, firstName: user.firstName },
    tool: { name: tool.name },
    loan: { startDate: loan.startDate, endDate: loan.endDate, status: loan.status },
  });

  const outboxId = yield* writer
    .table("outboxEvents")
    .insert({
      eventId: payload.eventId,
      loanId: loan._id,
      payload,
      status: "pending",
      attempts: 0,
      nextAttemptAt: yield* Clock.currentTimeMillis,
    })
    .pipe(Effect.orDie);

  yield* scheduler.runAfter(Duration.zero, refs.internal.outbox.dispatch, { outboxId });
});
