import { FunctionSpec, GroupSpec } from "@confect/core";
import * as Schema from "effect/Schema";
import { PublicTool } from "../shared/domain/Tool";

/** Public, unauthenticated reads. Returns name and category only, by design. */
export default GroupSpec.make().addFunction(
  FunctionSpec.publicQuery({
    name: "publicList",
    returns: () => Schema.Array(PublicTool),
  }),
);
