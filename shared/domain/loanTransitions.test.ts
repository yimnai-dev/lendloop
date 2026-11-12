import * as Result from "effect/Result";
import { describe, expect, it } from "vitest";
import { LOAN_STATUSES, type LoanStatus } from "./LoanStatus";
import { type LoanAction, type LoanActor, transition } from "./loanTransitions";

const ACTIONS: ReadonlyArray<LoanAction> = [
  "approve",
  "decline",
  "cancel",
  "markReturned",
];
const ACTORS: ReadonlyArray<LoanActor> = ["lender", "borrower", "system"];

/** Every allowed (from, action, actor) → to. Anything not listed must fail. */
const ALLOWED: ReadonlyArray<readonly [LoanStatus, LoanAction, LoanActor, LoanStatus]> = [
  ["pending", "approve", "lender", "approved"],
  ["pending", "decline", "lender", "declined"],
  ["pending", "decline", "system", "declined"],
  ["pending", "cancel", "borrower", "cancelled"],
  ["pending", "cancel", "system", "cancelled"],
  ["approved", "markReturned", "lender", "returned"],
];

const isAllowed = (from: LoanStatus, action: LoanAction, actor: LoanActor) =>
  ALLOWED.some(([f, a, r]) => f === from && a === action && r === actor);

const REJECTED = LOAN_STATUSES.flatMap((from) =>
  ACTIONS.flatMap((action) =>
    ACTORS.filter((actor) => !isAllowed(from, action, actor)).map(
      (actor) => [from, action, actor] as const,
    ),
  ),
);

const failureTag = (result: ReturnType<typeof transition>) =>
  Result.match(result, { onSuccess: () => undefined, onFailure: (error) => error._tag });

describe("loan transitions", () => {
  it.each(ALLOWED)("allows %s → %s by %s", (from, action, actor, to) => {
    expect(transition(from, action, actor)).toEqual(Result.succeed(to));
  });

  it.each(REJECTED)("rejects %s → %s by %s", (from, action, actor) => {
    expect(Result.isFailure(transition(from, action, actor))).toBe(true);
  });

  it("reports the actor problem before the state problem", () => {
    expect(failureTag(transition("returned", "approve", "borrower"))).toBe("Forbidden");
  });

  it("reports an invalid transition for the right actor", () => {
    expect(failureTag(transition("declined", "approve", "lender"))).toBe(
      "InvalidTransition",
    );
  });
});
