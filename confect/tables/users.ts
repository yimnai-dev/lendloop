import { Table } from "@confect/core";
import * as Schema from "effect/Schema";
import { Email, Role } from "../../shared/domain/User";

export default Table.make(() =>
  Schema.Struct({
    clerkId: Schema.String,
    email: Email,
    firstName: Schema.String,
    role: Role,
    trustedLender: Schema.Boolean,
    /** Set when the Clerk account is deleted; personal fields are scrubbed. */
    anonymizedAt: Schema.optionalKey(Schema.Finite),
  }),
)
  .index("by_clerkId", ["clerkId"])
  .index("by_trustedLender", ["trustedLender"]);
