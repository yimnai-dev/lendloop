import * as Schema from "effect/Schema";
import { Category } from "../shared/domain/Category";
import { Condition } from "../shared/domain/Condition";
import { IsoDate } from "../shared/domain/IsoDate";
import { LoanStatus } from "../shared/domain/LoanStatus";
import { Email, PublicProfile } from "../shared/domain/User";
import { Id } from "./_generated/id";
import { AutomationKind } from "./tables/automationEvents";

/**
 * Read models returned to signed-in users. Client-safe: imported by specs and
 * by the UI. Owners appear only as a first name and trusted badge.
 */

export const Booking = Schema.Struct({ startDate: IsoDate, endDate: IsoDate });
export type Booking = typeof Booking.Type;

export const Photo = Schema.Struct({ storageId: Id("_storage"), url: Schema.String });
export type Photo = typeof Photo.Type;

export const ToolCard = Schema.Struct({
  _id: Id("tools"),
  name: Schema.String,
  category: Category,
  condition: Condition,
  description: Schema.String,
  owner: PublicProfile,
  isMine: Schema.Boolean,
  photos: Schema.Array(Photo),
  /** Approved, unreturned loans; the UI derives availability from these. */
  bookings: Schema.Array(Booking),
});
export type ToolCard = typeof ToolCard.Type;

export const PendingRequest = Schema.Struct({
  loanId: Id("loans"),
  startDate: IsoDate,
  endDate: IsoDate,
});

export const ToolDetail = Schema.Struct({
  tool: ToolCard,
  myPendingRequest: Schema.NullOr(PendingRequest),
});
export type ToolDetail = typeof ToolDetail.Type;

export const MyListing = Schema.Struct({
  tool: ToolCard,
  pendingRequests: Schema.Finite,
});
export type MyListing = typeof MyListing.Type;

export const Activity = Schema.Struct({
  kind: AutomationKind,
  at: Schema.Finite,
  detail: Schema.optionalKey(Schema.String),
});
export type Activity = typeof Activity.Type;

export const LoanView = Schema.Struct({
  _id: Id("loans"),
  requestedAt: Schema.Finite,
  decidedAt: Schema.NullOr(Schema.Finite),
  returnedAt: Schema.NullOr(Schema.Finite),
  tool: Schema.Struct({ _id: Id("tools"), name: Schema.String, category: Category }),
  /** The other party. Email only once the loan is approved, for the handover. */
  counterpart: Schema.Struct({
    firstName: Schema.String,
    trustedLender: Schema.Boolean,
    email: Schema.NullOr(Email),
  }),
  startDate: IsoDate,
  endDate: IsoDate,
  status: LoanStatus,
  activity: Schema.Array(Activity),
});
export type LoanView = typeof LoanView.Type;
