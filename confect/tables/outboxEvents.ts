import { Table } from "@confect/core";
import * as Schema from "effect/Schema";
import { NotificationPayload } from "../../shared/integration/events";
import { Id } from "../_generated/id";

/**
 * Transactional outbox: written in the same mutation as the state change it
 * describes, then delivered to n8n by the dispatcher with retries.
 */
export default Table.make(() =>
  Schema.Struct({
    eventId: Schema.String,
    loanId: Id("loans"),
    payload: NotificationPayload,
    status: Schema.Literals(["pending", "delivered", "dead"]),
    attempts: Schema.Finite,
    nextAttemptAt: Schema.Finite,
    lastError: Schema.optionalKey(Schema.String),
    deliveredAt: Schema.optionalKey(Schema.Finite),
  }),
)
  .index("by_eventId", ["eventId"])
  .index("by_status_nextAttemptAt", ["status", "nextAttemptAt"])
  .index("by_loan", ["loanId"]);
