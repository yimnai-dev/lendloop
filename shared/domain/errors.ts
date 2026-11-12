import * as Schema from "effect/Schema";
import { LoanStatus } from "./LoanStatus";

/**
 * Domain errors shared by the backend and the UI. They cross the Convex
 * boundary as typed `_tag` unions, so clients branch on tags, never strings.
 */

export class NotFound extends Schema.TaggedError<NotFound>()("NotFound", {
  entity: Schema.Literals(["tool", "loan", "user"]),
}) {}

export class Forbidden extends Schema.TaggedError<Forbidden>()("Forbidden", {
  reason: Schema.String,
}) {}

export class InvalidTransition extends Schema.TaggedError<InvalidTransition>()(
  "InvalidTransition",
  { from: LoanStatus, action: Schema.String },
) {}

export class DateConflict extends Schema.TaggedError<DateConflict>()(
  "DateConflict",
  {},
) {}

export class InvalidRequest extends Schema.TaggedError<InvalidRequest>()(
  "InvalidRequest",
  {
    reason: Schema.String,
  },
) {}

export class RateLimited extends Schema.TaggedError<RateLimited>()("RateLimited", {
  retryAfterMs: Schema.Finite,
}) {}
