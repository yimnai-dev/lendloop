import { MiddlewareSpec } from "@confect/core";
import * as Schema from "effect/Schema";
import type { CurrentUser } from "./RequireUser.spec";

export class AdminOnly extends Schema.TaggedError<AdminOnly>()("AdminOnly", {}) {}

/** Role gate; attach after `RequireUser`, e.g. `.middleware(RequireRole, { admin: true })`. */
export default class RequireRole extends MiddlewareSpec.MiddlewareSpec<
  RequireRole,
  { requires: CurrentUser }
>()("RequireRole", {
  options: () =>
    Schema.Struct({
      admin: Schema.optionalKey(Schema.Boolean),
      user: Schema.optionalKey(Schema.Boolean),
    }),
  error: () => AdminOnly,
  functionTypes: { query: true, mutation: true, action: false },
}) {}
