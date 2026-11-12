import * as Effect from "effect/Effect";
import { Forbidden, NotFound } from "../../shared/domain/errors";
import type { LoanActor } from "../../shared/domain/loanTransitions";
import type { Id } from "../_generated/id";
import { CurrentUser } from "../middleware/RequireUser.spec";
import { loadLoan, loadTool } from "./load";

/** A tool the current user owns. Admin overrides live in the admin group. */
export const requireOwnTool = Effect.fn("requireOwnTool")(function* (
  toolId: Id<"tools">,
) {
  const { user } = yield* CurrentUser;
  const tool = yield* loadTool(toolId);
  if (tool.ownerId !== user._id) {
    return yield* new Forbidden({ reason: "You can only manage your own listings" });
  }
  return tool;
});

/** A non-archived tool visible to any signed-in user. */
export const requireVisibleTool = Effect.fn("requireVisibleTool")(function* (
  toolId: Id<"tools">,
) {
  const tool = yield* loadTool(toolId);
  if (tool.archived) return yield* new NotFound({ entity: "tool" });
  return tool;
});

/**
 * A loan the current user is party to, with their role in it. Strangers get
 * `NotFound` rather than `Forbidden` so loan ids can't be probed.
 */
export const requireLoanParty = Effect.fn("requireLoanParty")(function* (
  loanId: Id<"loans">,
) {
  const { user } = yield* CurrentUser;
  const loan = yield* loadLoan(loanId);
  const actor: LoanActor | undefined =
    loan.lenderId === user._id
      ? "lender"
      : loan.borrowerId === user._id
        ? "borrower"
        : undefined;
  if (actor === undefined) return yield* new NotFound({ entity: "loan" });
  return { loan, actor };
});
