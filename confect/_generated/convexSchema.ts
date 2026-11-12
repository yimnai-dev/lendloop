import { defineSchema as $defineSchema } from "convex/server";
import { Table as $Table } from "@confect/server";

import automationEvents from "./tables/automationEvents";
import loans from "./tables/loans";
import outboxEvents from "./tables/outboxEvents";
import tools from "./tables/tools";
import trustAudit from "./tables/trustAudit";
import users from "./tables/users";

export default $defineSchema({
  automationEvents: $Table.tableDefinition(automationEvents),
  loans: $Table.tableDefinition(loans),
  outboxEvents: $Table.tableDefinition(outboxEvents),
  tools: $Table.tableDefinition(tools),
  trustAudit: $Table.tableDefinition(trustAudit),
  users: $Table.tableDefinition(users),
});
