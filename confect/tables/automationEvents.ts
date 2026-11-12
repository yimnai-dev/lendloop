import { Table } from "@confect/core";
import * as Schema from "effect/Schema";
import { Id } from "../_generated/id";

export const AutomationKind = Schema.Literals([
  "notification_delivered",
  "notification_dead",
  "reminder_sent",
  "reminder_failed",
  "workflow_error",
]);

/**
 * What the automations did, shown on each loan's timeline and on the admin
 * dashboard. `idempotencyKey` is unique, so retried write-backs are no-ops.
 */
export default Table.make(() =>
  Schema.Struct({
    idempotencyKey: Schema.String,
    kind: AutomationKind,
    loanId: Schema.optionalKey(Id("loans")),
    detail: Schema.optionalKey(Schema.String),
    at: Schema.Finite,
  }),
)
  .index("by_idempotencyKey", ["idempotencyKey"])
  .index("by_loan", ["loanId"])
  .index("by_kind", ["kind"]);
