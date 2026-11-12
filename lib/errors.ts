import type {
  DateConflict,
  Forbidden,
  InvalidRequest,
  InvalidTransition,
  NotFound,
  RateLimited,
} from "~/shared/domain/errors";
import type { AdminOnly } from "~/confect/middleware/RequireRole.spec";
import type {
  AccountNotProvisioned,
  NotSignedIn,
} from "~/confect/middleware/RequireUser.spec";

/** Every typed error a LendLoop function can return to the client. */
export type AppError =
  | NotFound
  | Forbidden
  | InvalidTransition
  | DateConflict
  | InvalidRequest
  | RateLimited
  | NotSignedIn
  | AccountNotProvisioned
  | AdminOnly;

const ACTION_LABELS: Record<string, string> = {
  approve: "approved",
  decline: "declined",
  cancel: "cancelled",
  markReturned: "marked returned",
};

export const describeError = (error: AppError): string => {
  switch (error._tag) {
    case "NotFound":
      return `That ${error.entity} no longer exists.`;
    case "Forbidden":
    case "InvalidRequest":
      return error.reason;
    case "InvalidTransition":
      return `A ${error.from} loan can't be ${ACTION_LABELS[error.action] ?? error.action}.`;
    case "DateConflict":
      return "Those dates overlap an approved loan.";
    case "RateLimited":
      return `Slow down — try again in ${Math.ceil(error.retryAfterMs / 60_000)} min.`;
    case "NotSignedIn":
      return "Please sign in again.";
    case "AccountNotProvisioned":
      return "Your account is still being set up.";
    case "AdminOnly":
      return "Only admins can do that.";
  }
};
