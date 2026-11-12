import { FunctionImpl, GroupImpl } from "@confect/server";
import * as Clock from "effect/Clock";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { overlaps } from "../shared/domain/DateRange";
import { DateConflict, Forbidden, InvalidRequest } from "../shared/domain/errors";
import { todayIn } from "../shared/domain/IsoDate";
import { checkRequestWindow } from "../shared/domain/loanRequest";
import type { LoanAction } from "../shared/domain/loanTransitions";
import type { Id } from "./_generated/id";
import databaseSchema from "./_generated/schema";
import { DatabaseReader, DatabaseWriter } from "./_generated/services";
import { consumeRateLimit } from "./lib/rateLimit";
import { toLoanView } from "./lib/views";
import loans from "./loans.spec";
import { loansForTool } from "./loans/queries";
import { applyTransition } from "./loans/transition";
import { enqueueNotification } from "./outbox/enqueue";
import RequireUserImpl from "./middleware/RequireUser.impl";
import { CurrentUser } from "./middleware/RequireUser.spec";
import { requireLoanParty, requireVisibleTool } from "./policies/access";

/** The neighborhood's time zone decides what "today" means. */
const today = Effect.gen(function* () {
  const timeZone = yield* Config.String("APP_TZ").pipe(Config.withDefault("UTC"));
  return todayIn(timeZone, yield* Clock.currentTimeMillis);
}).pipe(Effect.orDie);

const request = FunctionImpl.make(databaseSchema, loans, "request", ({ toolId, dates }) =>
  Effect.gen(function* () {
    const { user } = yield* CurrentUser;
    const tool = yield* requireVisibleTool(toolId);
    if (tool.ownerId === user._id) {
      return yield* new Forbidden({ reason: "You can't borrow your own tool" });
    }
    yield* Effect.fromResult(checkRequestWindow(dates, yield* today));

    const pending = yield* loansForTool(tool._id, "pending");
    if (pending.some((loan) => loan.borrowerId === user._id)) {
      return yield* new InvalidRequest({
        reason: "You already have a pending request for this tool",
      });
    }
    const approved = yield* loansForTool(tool._id, "approved");
    if (approved.some((loan) => overlaps(loan, dates))) return yield* new DateConflict();

    yield* consumeRateLimit("requestLoan", user._id);
    const writer = yield* DatabaseWriter;
    const loan = {
      toolId: tool._id,
      borrowerId: user._id,
      lenderId: tool.ownerId,
      ...dates,
      status: "pending" as const,
    };
    const loanId = yield* writer.table("loans").insert(loan).pipe(Effect.orDie);
    const reader = yield* DatabaseReader;
    const inserted = yield* reader.table("loans").get(loanId).pipe(Effect.orDie);
    yield* enqueueNotification(inserted, "request_created", "lender");
    return loanId;
  }),
);

/**
 * Approval claims the dates: it fails if they clash with another approved
 * loan, and declines every pending request that overlaps them.
 */
const approve = FunctionImpl.make(databaseSchema, loans, "approve", ({ loanId }) =>
  Effect.gen(function* () {
    const { loan, actor } = yield* requireLoanParty(loanId);
    const approved = yield* loansForTool(loan.toolId, "approved");
    if (approved.some((other) => overlaps(other, loan))) return yield* new DateConflict();

    yield* applyTransition(loan, "approve", actor);
    const pending = yield* loansForTool(loan.toolId, "pending");
    yield* Effect.forEach(
      pending.filter((other) => other._id !== loan._id && overlaps(other, loan)),
      (other) => applyTransition(other, "decline", "system").pipe(Effect.orDie),
    );
    return null;
  }),
);

/** The caller's role in the loan becomes the actor; the table decides. */
const actOn = (loanId: Id<"loans">, action: LoanAction) =>
  Effect.gen(function* () {
    const { loan, actor } = yield* requireLoanParty(loanId);
    yield* applyTransition(loan, action, actor);
    return null;
  });

const decline = FunctionImpl.make(databaseSchema, loans, "decline", ({ loanId }) =>
  actOn(loanId, "decline"),
);
const cancel = FunctionImpl.make(databaseSchema, loans, "cancel", ({ loanId }) =>
  actOn(loanId, "cancel"),
);
const markReturned = FunctionImpl.make(
  databaseSchema,
  loans,
  "markReturned",
  ({ loanId }) => actOn(loanId, "markReturned"),
);

const listBy = (index: "by_borrower" | "by_lender") =>
  Effect.gen(function* () {
    const { user } = yield* CurrentUser;
    const reader = yield* DatabaseReader;
    const docs = yield* reader
      .table("loans")
      .index(
        index,
        (q) =>
          index === "by_borrower"
            ? q.eq("borrowerId", user._id)
            : q.eq("lenderId", user._id),
        "desc",
      )
      .collect();
    const perspective = index === "by_borrower" ? "borrower" : "lender";
    return yield* Effect.forEach(docs, (loan) => toLoanView(loan, perspective));
  }).pipe(Effect.orDie);

const myRequests = FunctionImpl.make(databaseSchema, loans, "myRequests", () =>
  listBy("by_borrower"),
);
const incoming = FunctionImpl.make(databaseSchema, loans, "incoming", () =>
  listBy("by_lender"),
);

export default GroupImpl.make(databaseSchema, loans).pipe(
  Layer.provide(request),
  Layer.provide(approve),
  Layer.provide(decline),
  Layer.provide(cancel),
  Layer.provide(markReturned),
  Layer.provide(myRequests),
  Layer.provide(incoming),
  Layer.provide(RequireUserImpl),
  GroupImpl.finalize,
);
