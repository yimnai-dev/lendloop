import type { Document } from "@confect/server";
import type schemaDefinition from "./schema";

export type AutomationEventsDoc = Document.Document<typeof schemaDefinition, "automationEvents">;
export type LoansDoc = Document.Document<typeof schemaDefinition, "loans">;
export type OutboxEventsDoc = Document.Document<typeof schemaDefinition, "outboxEvents">;
export type ToolsDoc = Document.Document<typeof schemaDefinition, "tools">;
export type TrustAuditDoc = Document.Document<typeof schemaDefinition, "trustAudit">;
export type UsersDoc = Document.Document<typeof schemaDefinition, "users">;

export interface Docs {
  automationEvents: AutomationEventsDoc;
  loans: LoansDoc;
  outboxEvents: OutboxEventsDoc;
  tools: ToolsDoc;
  trustAudit: TrustAuditDoc;
  users: UsersDoc;
}
