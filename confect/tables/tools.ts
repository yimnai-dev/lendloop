import { Table } from "@confect/core";
import * as Schema from "effect/Schema";
import { Category } from "../../shared/domain/Category";
import { Condition } from "../../shared/domain/Condition";
import { MAX_TOOL_PHOTOS, ToolDescription, ToolName } from "../../shared/domain/Tool";
import { Id } from "../_generated/id";

export default Table.make(() =>
  Schema.Struct({
    ownerId: Id("users"),
    name: ToolName,
    category: Category,
    condition: Condition,
    description: ToolDescription,
    photoIds: Schema.Array(Id("_storage")).check(Schema.isMaxLength(MAX_TOOL_PHOTOS)),
    /** Soft delete: archived tools keep their loan history. */
    archived: Schema.Boolean,
  }),
)
  .index("by_owner", ["ownerId", "archived"])
  .index("by_archived_category", ["archived", "category"]);
