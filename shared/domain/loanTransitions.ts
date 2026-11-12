import * as Result from "effect/Result";
import { Forbidden, InvalidTransition } from "./errors";
import type { LoanStatus } from "./LoanStatus";

/**
 * Who is acting on a loan. `system` covers automatic changes, such as
 * declining overlapping requests when another one is approved.
 */
export type LoanActor = "lender" | "borrower" | "system";

export type LoanAction = keyof typeof TRANSITIONS;

type Rule = {
  readonly from: LoanStatus;
  readonly to: LoanStatus;
  readonly actors: ReadonlyArray<LoanActor>;
};

const TRANSITIONS = {
  approve: { from: "pending", to: "approved", actors: ["lender"] },
  decline: { from: "pending", to: "declined", actors: ["lender", "system"] },
  cancel: { from: "pending", to: "cancelled", actors: ["borrower", "system"] },
  markReturned: { from: "approved", to: "returned", actors: ["lender"] },
} as const satisfies Record<string, Rule>;

/** The single source of truth for loan state changes. */
export const transition = (
  current: LoanStatus,
  action: LoanAction,
  actor: LoanActor,
): Result.Result<LoanStatus, InvalidTransition | Forbidden> => {
  const rule: Rule = TRANSITIONS[action];
  if (!rule.actors.includes(actor)) {
    return Result.fail(new Forbidden({ reason: `A ${actor} cannot ${action} a loan` }));
  }
  if (rule.from !== current) {
    return Result.fail(new InvalidTransition({ from: current, action }));
  }
  return Result.succeed(rule.to);
};

/** Statuses that still hold the tool's calendar. */
export const isBlocking = (status: LoanStatus): boolean => status === "approved";

/** Statuses after which nothing else can happen. */
export const isFinal = (status: LoanStatus): boolean =>
  status === "declined" || status === "cancelled" || status === "returned";
