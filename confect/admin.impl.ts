import { FunctionImpl, GroupImpl } from "@confect/server";
import * as Clock from "effect/Clock";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { InvalidRequest, NotFound } from "../shared/domain/errors";
import databaseSchema from "./_generated/schema";
import { DatabaseReader, DatabaseWriter } from "./_generated/services";
import admin from "./admin.spec";
import { toAdminListing, toAdminLoan, toAdminUser } from "./admin/views";
import { archiveTool } from "./loans/archiveTool";
import RequireRoleImpl from "./middleware/RequireRole.impl";
import { CurrentUser } from "./middleware/RequireUser.spec";
import RequireUserImpl from "./middleware/RequireUser.impl";
import { loadTool, loadUser } from "./policies/load";

const LIST_LIMIT = 200;

const loans = FunctionImpl.make(databaseSchema, admin, "loans", ({ status }) =>
  Effect.gen(function* () {
    const reader = yield* DatabaseReader;
    const docs = yield* status === undefined
      ? reader.table("loans").index("by_creation_time", "desc").take(LIST_LIMIT)
      : reader
          .table("loans")
          .index("by_status_endDate", (q) => q.eq("status", status), "desc")
          .take(LIST_LIMIT);
    return yield* Effect.forEach(docs, toAdminLoan);
  }).pipe(Effect.orDie),
);

const users = FunctionImpl.make(databaseSchema, admin, "users", () =>
  Effect.gen(function* () {
    const reader = yield* DatabaseReader;
    const docs = yield* reader.table("users").index("by_creation_time").take(LIST_LIMIT);
    const active = docs.filter((user) => user.anonymizedAt === undefined);
    return yield* Effect.forEach(active, toAdminUser);
  }).pipe(Effect.orDie),
);

const listings = FunctionImpl.make(databaseSchema, admin, "listings", () =>
  Effect.gen(function* () {
    const reader = yield* DatabaseReader;
    const docs = yield* reader
      .table("tools")
      .index("by_archived_category", (q) => q.eq("archived", false))
      .take(LIST_LIMIT);
    return yield* Effect.forEach(docs, toAdminListing);
  }).pipe(Effect.orDie),
);

const removeListing = FunctionImpl.make(
  databaseSchema,
  admin,
  "removeListing",
  ({ toolId }) =>
    Effect.gen(function* () {
      const tool = yield* loadTool(toolId);
      if (tool.archived) return yield* new NotFound({ entity: "tool" });
      yield* archiveTool(tool);
      return null;
    }),
);

/** Grants or revokes the badge and appends to `trustAudit` in the same transaction. */
const setTrustedLender = FunctionImpl.make(
  databaseSchema,
  admin,
  "setTrustedLender",
  ({ userId, trusted }) =>
    Effect.gen(function* () {
      const { user: actor } = yield* CurrentUser;
      const target = yield* loadUser(userId);
      if (target.anonymizedAt !== undefined)
        return yield* new NotFound({ entity: "user" });
      if (target.trustedLender === trusted) {
        return yield* new InvalidRequest({
          reason: trusted ? "Already a Trusted Lender" : "Not a Trusted Lender",
        });
      }
      const writer = yield* DatabaseWriter;
      yield* writer
        .table("users")
        .patch(target._id, { trustedLender: trusted })
        .pipe(Effect.orDie);
      yield* writer
        .table("trustAudit")
        .insert({
          userId: target._id,
          actorId: actor._id,
          action: trusted ? "grant" : "revoke",
          at: yield* Clock.currentTimeMillis,
        })
        .pipe(Effect.orDie);
      return null;
    }),
);

export default GroupImpl.make(databaseSchema, admin).pipe(
  Layer.provide(loans),
  Layer.provide(users),
  Layer.provide(listings),
  Layer.provide(removeListing),
  Layer.provide(setTrustedLender),
  Layer.provide(RequireRoleImpl),
  Layer.provide(RequireUserImpl),
  GroupImpl.finalize,
);
