import * as Schema from "effect/Schema";
import { Category } from "../shared/domain/Category";
import { IsoDate } from "../shared/domain/IsoDate";
import { LoanStatus } from "../shared/domain/LoanStatus";
import { Email, Role } from "../shared/domain/User";
import { Id } from "./_generated/id";

/**
 * Read models for admins only. Admins moderate, so they see who owns what,
 * but loans still show first names only: an admin never needs a borrower's
 * email to remove a listing or audit a loan.
 */

export const AdminParty = Schema.Struct({ _id: Id("users"), firstName: Schema.String });

export const AdminLoan = Schema.Struct({
  _id: Id("loans"),
  requestedAt: Schema.Finite,
  tool: Schema.Struct({
    _id: Id("tools"),
    name: Schema.String,
    archived: Schema.Boolean,
  }),
  lender: AdminParty,
  borrower: AdminParty,
  startDate: IsoDate,
  endDate: IsoDate,
  status: LoanStatus,
});
export type AdminLoan = typeof AdminLoan.Type;

export const TrustChange = Schema.Struct({
  action: Schema.Literals(["grant", "revoke"]),
  at: Schema.Finite,
  actorFirstName: Schema.String,
});

export const AdminUser = Schema.Struct({
  _id: Id("users"),
  firstName: Schema.String,
  email: Email,
  role: Role,
  trustedLender: Schema.Boolean,
  activeListings: Schema.Finite,
  lastTrustChange: Schema.NullOr(TrustChange),
});
export type AdminUser = typeof AdminUser.Type;

export const AdminListing = Schema.Struct({
  _id: Id("tools"),
  name: Schema.String,
  category: Category,
  owner: AdminParty,
  onLoan: Schema.Boolean,
});
export type AdminListing = typeof AdminListing.Type;
