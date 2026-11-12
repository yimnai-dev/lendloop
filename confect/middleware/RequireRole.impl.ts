import { MiddlewareImpl } from "@confect/server";
import * as Effect from "effect/Effect";
import databaseSchema from "../_generated/schema";
import RequireRole, { AdminOnly } from "./RequireRole.spec";
import { CurrentUser } from "./RequireUser.spec";

export default MiddlewareImpl.make(databaseSchema, RequireRole, (effect, { options }) =>
  Effect.gen(function* () {
    const { user } = yield* CurrentUser;
    if (options[user.role] !== true) {
      return yield* new AdminOnly();
    }
    return yield* effect;
  }),
);
