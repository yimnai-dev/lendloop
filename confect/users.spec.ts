import { FunctionSpec, GroupSpec } from "@confect/core";
import * as Schema from "effect/Schema";
import { Email, Role } from "../shared/domain/User";

/** The UI derives its account gate from this; it never fails. */
export const Viewer = Schema.Union([
  Schema.TaggedStruct("SignedOut", {}),
  Schema.TaggedStruct("Provisioning", {}),
  Schema.TaggedStruct("Ready", {
    firstName: Schema.String,
    email: Email,
    role: Role,
    trustedLender: Schema.Boolean,
  }),
]);
export type Viewer = typeof Viewer.Type;

export const ClerkUser = {
  clerkId: Schema.String,
  email: Email,
  firstName: Schema.String,
};

export default GroupSpec.make()
  .addFunction(FunctionSpec.publicQuery({ name: "viewer", returns: () => Viewer }))
  .addFunction(
    FunctionSpec.internalMutation({
      name: "upsertFromClerk",
      args: () => ClerkUser,
      returns: () => Schema.Null,
    }),
  )
  .addFunction(
    FunctionSpec.internalMutation({
      name: "anonymize",
      args: () => ({ clerkId: Schema.String }),
      returns: () => Schema.Null,
    }),
  );
