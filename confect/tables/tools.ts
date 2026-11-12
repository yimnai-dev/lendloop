import { Table } from "@confect/core";
import * as Schema from "effect/Schema";
import { Category } from "../../shared/domain/Category";
import { Condition } from "../../shared/domain/Condition";
import { ToolDescription, ToolName } from "../../shared/domain/Tool";
import { Id } from "../_generated/id";

export default Table.make(() =>
  Schema.Struct({
    ownerId: Id("users"),
    name: ToolName,
    category: Category,
    condition: Condition,
    description: ToolDescription,
    photoId: Schema.optionalKey(Id("_storage")),
    /** Soft delete: archived tools keep their loan history. */
    archived: Schema.Boolean,
  }),
)
  .index("by_owner", ["ownerId", "archived"])
  .index("by_archived_category", ["archived", "category"]);
