import { MiddlewareImpl } from "@confect/server";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import databaseSchema from "../_generated/schema";
import { Auth, DatabaseReader } from "../_generated/services";
import RequireUser, {
  AccountNotProvisioned,
  CurrentUser,
  NotSignedIn,
} from "./RequireUser.spec";

export default MiddlewareImpl.provides(
  databaseSchema,
  RequireUser,
  CurrentUser,
  Effect.gen(function* () {
    const auth = yield* Auth;
    const reader = yield* DatabaseReader;

    const identity = yield* auth.getUserIdentity.pipe(
      Effect.mapError(() => new NotSignedIn()),
    );
    const user = yield* reader
      .table("users")
      .index("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first()
      .pipe(Effect.orDie);

    if (Option.isNone(user) || user.value.anonymizedAt !== undefined) {
      return yield* new AccountNotProvisioned();
    }
    return { user: user.value };
  }),
);
