import { FunctionSpec, GroupSpec } from "@confect/core";
import * as Schema from "effect/Schema";

/** Demo data for local runs and reviews. Internal: `npx convex run seed:demo`. */
export default GroupSpec.make().addFunction(
  FunctionSpec.internalMutation({
    name: "demo",
    returns: () =>
      Schema.Struct({
        created: Schema.Boolean,
        users: Schema.Finite,
        tools: Schema.Finite,
        loans: Schema.Finite,
      }),
  }),
);
