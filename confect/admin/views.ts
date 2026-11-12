import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import { DatabaseReader } from "../_generated/services";
import type loans from "../_generated/tables/loans";
import type tools from "../_generated/tables/tools";
import type users from "../_generated/tables/users";
import type { AdminListing, AdminLoan, AdminUser } from "../adminViews";
import { loansForTool } from "../loans/queries";
import { loadTool, loadUser } from "../policies/load";

const party = Effect.fn("adminParty")(function* (userId: (typeof users.Doc.Type)["_id"]) {
  const user = yield* loadUser(userId);
  return { _id: user._id, firstName: user.firstName };
});

export const toAdminLoan = Effect.fn("toAdminLoan")(function* (
  loan: typeof loans.Doc.Type,
) {
  const tool = yield* loadTool(loan.toolId);
  const view: AdminLoan = {
    _id: loan._id,
    requestedAt: loan._creationTime,
    tool: { _id: tool._id, name: tool.name, archived: tool.archived },
    lender: yield* party(loan.lenderId),
    borrower: yield* party(loan.borrowerId),
    startDate: loan.startDate,
    endDate: loan.endDate,
    status: loan.status,
  };
  return view;
});

export const toAdminUser = Effect.fn("toAdminUser")(function* (
  user: typeof users.Doc.Type,
) {
  const reader = yield* DatabaseReader;
  const listings = yield* reader
    .table("tools")
    .index("by_owner", (q) => q.eq("ownerId", user._id).eq("archived", false))
    .collect();
  const last = yield* reader
    .table("trustAudit")
    .index("by_user", (q) => q.eq("userId", user._id), "desc")
    .first();
  const lastTrustChange = Option.isNone(last)
    ? null
    : {
        action: last.value.action,
        at: last.value.at,
        actorFirstName: (yield* loadUser(last.value.actorId)).firstName,
      };
  const view: AdminUser = {
    _id: user._id,
    firstName: user.firstName,
    email: user.email,
    role: user.role,
    trustedLender: user.trustedLender,
    activeListings: listings.length,
    lastTrustChange,
  };
  return view;
});

export const toAdminListing = Effect.fn("toAdminListing")(function* (
  tool: typeof tools.Doc.Type,
) {
  const view: AdminListing = {
    _id: tool._id,
    name: tool.name,
    category: tool.category,
    owner: yield* party(tool.ownerId),
    onLoan: (yield* loansForTool(tool._id, "approved")).length > 0,
  };
  return view;
});
