import * as Schema from "effect/Schema";
import { Category } from "./Category";
import { Condition } from "./Condition";

const trimmedText = (min: number, max: number) =>
  Schema.Trimmed.check(
    Schema.isMinLength(min, { message: `Must be at least ${min} characters` }),
    Schema.isMaxLength(max, { message: `Must be at most ${max} characters` }),
  );

export const ToolName = trimmedText(2, 80);
export const ToolDescription = trimmedText(0, 500);

/** The fields an owner edits. Shared by forms, function args and the table. */
export const ToolFields = Schema.Struct({
  name: ToolName,
  category: Category,
  condition: Condition,
  description: ToolDescription,
});
export type ToolFields = typeof ToolFields.Type;

/** All the public landing page may reveal about a tool. */
export const PublicTool = Schema.Struct({
  name: Schema.String,
  category: Category,
});
export type PublicTool = typeof PublicTool.Type;
