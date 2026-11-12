import { DatabaseSchema as $DatabaseSchema } from "@confect/server";

import automationEvents from "./tables/automationEvents";
import loans from "./tables/loans";
import outboxEvents from "./tables/outboxEvents";
import tools from "./tables/tools";
import trustAudit from "./tables/trustAudit";
import users from "./tables/users";

const databaseSchema: $DatabaseSchema.DatabaseSchema<{
  readonly automationEvents: typeof automationEvents;
  readonly loans: typeof loans;
  readonly outboxEvents: typeof outboxEvents;
  readonly tools: typeof tools;
  readonly trustAudit: typeof trustAudit;
  readonly users: typeof users;
}> = $DatabaseSchema.make({
  automationEvents,
  loans,
  outboxEvents,
  tools,
  trustAudit,
  users,
});

export default databaseSchema;
