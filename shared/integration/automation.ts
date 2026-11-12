import * as Schema from "effect/Schema";
import { IsoDate } from "../domain/IsoDate";
import { Email } from "../domain/User";

/**
 * The n8n ⇄ Convex contract. Every request is HMAC-signed (see
 * `signature.ts`) with N8N_TO_CONVEX_SECRET.
 */

export const AUTOMATION_PATHS = {
  overdueLoans: "/automation/overdue-loans",
  reminders: "/automation/reminders",
  errors: "/automation/errors",
} as const;

/** `<loanId>:<YYYY-MM-DD>`: one reminder per loan per day. */
export const ReminderKey = Schema.String.check(
  Schema.isPattern(/^[a-z0-9]{20,40}:\d{4}-\d{2}-\d{2}$/, {
    message: "Expected <loanId>:<YYYY-MM-DD>",
  }),
);

export const reminderKey = (loanId: string, date: IsoDate) => `${loanId}:${date}`;

/** Minimal: just what the reminder email needs. */
export const OverdueReminder = Schema.Struct({
  reminderKey: ReminderKey,
  loanId: Schema.String,
  recipient: Schema.Struct({ email: Email, firstName: Schema.String }),
  tool: Schema.Struct({ name: Schema.String }),
  loan: Schema.Struct({ startDate: IsoDate, endDate: IsoDate }),
  daysOverdue: Schema.Int,
});
export type OverdueReminder = typeof OverdueReminder.Type;

export const OverdueResponse = Schema.Struct({
  date: IsoDate,
  reminders: Schema.Array(OverdueReminder),
});
export type OverdueResponse = typeof OverdueResponse.Type;

export const ReminderResult = Schema.Struct({
  reminderKey: ReminderKey,
  status: Schema.Literals(["sent", "failed"]),
  detail: Schema.optionalKey(Schema.String.check(Schema.isMaxLength(500))),
});
export type ReminderResult = typeof ReminderResult.Type;

export const WorkflowError = Schema.Struct({
  executionId: Schema.String.check(Schema.isMinLength(1), Schema.isMaxLength(100)),
  workflow: Schema.String.check(Schema.isMaxLength(200)),
  node: Schema.optionalKey(Schema.String.check(Schema.isMaxLength(200))),
  message: Schema.String.check(Schema.isMaxLength(2000)),
});
export type WorkflowError = typeof WorkflowError.Type;

export const WriteBackResponse = Schema.Struct({ duplicate: Schema.Boolean });
