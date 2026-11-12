import { Table } from "@confect/core";
import * as Schema from "effect/Schema";
import { Id } from "../_generated/id";

/** Who granted or revoked Trusted Lender, and when. Append-only. */
export default Table.make(() =>
  Schema.Struct({
    userId: Id("users"),
    actorId: Id("users"),
    action: Schema.Literals(["grant", "revoke"]),
    at: Schema.Finite,
  }),
).index("by_user", ["userId"]);
