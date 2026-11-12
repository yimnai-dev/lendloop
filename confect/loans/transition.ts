import * as Clock from "effect/Clock";
import * as Effect from "effect/Effect";
import {
  transition,
  type LoanAction,
  type LoanActor,
} from "../../shared/domain/loanTransitions";
import type { NotificationType } from "../../shared/integration/events";
import { DatabaseWriter } from "../_generated/services";
import type loans from "../_generated/tables/loans";
import { enqueueNotification, type Recipient } from "../outbox/enqueue";

type LoanDoc = typeof loans.Doc.Type;

/** Which notification each action sends, and to whom. */
const NOTIFY: Record<LoanAction, { type: NotificationType; to: Recipient }> = {
  approve: { type: "request_approved", to: "borrower" },
  decline: { type: "request_declined", to: "borrower" },
  cancel: { type: "request_cancelled", to: "lender" },
  markReturned: { type: "loan_returned", to: "borrower" },
};

/**
 * The only way loan status changes: validates against the transition table,
 * stamps the timestamp, and enqueues the notification in the same transaction.
 * `notifyOverride` lets system cancellations notify the borrower instead.
 */
export const applyTransition = Effect.fn("applyTransition")(function* (
  loan: LoanDoc,
  action: LoanAction,
  actor: LoanActor,
  notifyOverride?: Recipient,
) {
  const status = yield* Effect.fromResult(transition(loan.status, action, actor));
  const writer = yield* DatabaseWriter;
  const now = yield* Clock.currentTimeMillis;
  const stamp = action === "markReturned" ? { returnedAt: now } : { decidedAt: now };

  yield* writer
    .table("loans")
    .patch(loan._id, { status, ...stamp })
    .pipe(Effect.orDie);
  const updated: LoanDoc = { ...loan, status, ...stamp };

  const { type, to } = NOTIFY[action];
  yield* enqueueNotification(updated, type, notifyOverride ?? to);
  return updated;
});
