import * as Schema from "effect/Schema";
import { IsoDate } from "../domain/IsoDate";
import { LoanStatus } from "../domain/LoanStatus";

/** Loan events Convex sends to the n8n notification workflow. */
export const NOTIFICATION_TYPES = [
  "request_created",
  "request_approved",
  "request_declined",
  "request_cancelled",
  "loan_returned",
] as const;

export const NotificationType = Schema.Literals(NOTIFICATION_TYPES);
export type NotificationType = typeof NotificationType.Type;

/**
 * The full payload n8n receives. It holds only what the email needs:
 * no ids of other users, no owner details beyond the recipient's own.
 */
export const NotificationPayload = Schema.Struct({
  eventId: Schema.String,
  type: NotificationType,
  recipient: Schema.Struct({ email: Schema.String, firstName: Schema.String }),
  tool: Schema.Struct({ name: Schema.String }),
  loan: Schema.Struct({ startDate: IsoDate, endDate: IsoDate, status: LoanStatus }),
});
export type NotificationPayload = typeof NotificationPayload.Type;
