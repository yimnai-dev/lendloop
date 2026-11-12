import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import { Id } from "~/confect/_generated/id";

/** Route params are untrusted strings; decode them into typed document ids. */
export const toolIdFrom = (raw: string) =>
  Option.getOrUndefined(Schema.decodeUnknownOption(Id("tools"))(raw));
