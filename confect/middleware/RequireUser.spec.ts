import { MiddlewareSpec } from "@confect/core";
import * as Context from "effect/Context";
import * as Schema from "effect/Schema";
import type users from "../_generated/tables/users";

export class CurrentUser extends Context.Service<
  CurrentUser,
  { readonly user: typeof users.Doc.Type }
>()("lendloop/confect/middleware/RequireUser/CurrentUser") {}

export class NotSignedIn extends Schema.TaggedError<NotSignedIn>()("NotSignedIn", {}) {}

/** Signed in with Clerk, but the Clerk webhook hasn't created the user yet. */
export class AccountNotProvisioned extends Schema.TaggedError<AccountNotProvisioned>()(
  "AccountNotProvisioned",
  {},
) {}

/** Resolves the Clerk identity to our user record and provides it to handlers. */
export default class RequireUser extends MiddlewareSpec.MiddlewareSpec<
  RequireUser,
  { provides: CurrentUser }
>()("RequireUser", {
  error: () => Schema.Union([NotSignedIn, AccountNotProvisioned]),
  functionTypes: { query: true, mutation: true, action: false },
}) {}
