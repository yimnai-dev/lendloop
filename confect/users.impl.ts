import { FunctionImpl, GroupImpl } from "@confect/server";
import * as Clock from "effect/Clock";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import { Email } from "../shared/domain/User";
import databaseSchema from "./_generated/schema";
import { Auth, DatabaseReader, DatabaseWriter } from "./_generated/services";
import users from "./users.spec";

const findByClerkId = (clerkId: string) =>
  Effect.flatMap(DatabaseReader, (reader) =>
    reader
      .table("users")
      .index("by_clerkId", (q) => q.eq("clerkId", clerkId))
      .first(),
  ).pipe(Effect.orDie);

/** Comma-separated allowlist; matching emails become admin on first sync. */
const adminEmails = Config.String("ADMIN_EMAILS").pipe(
  Config.withDefault(""),
  Config.map(
    (raw) =>
      new Set(
        raw
          .split(",")
          .map((email) => email.trim().toLowerCase())
          .filter((email) => email.length > 0),
      ),
  ),
);

const viewer = FunctionImpl.make(databaseSchema, users, "viewer", () =>
  Effect.gen(function* () {
    const auth = yield* Auth;
    const identity = yield* Effect.option(auth.getUserIdentity);
    if (Option.isNone(identity)) return { _tag: "SignedOut" } as const;

    const user = yield* findByClerkId(identity.value.subject);
    if (Option.isNone(user) || user.value.anonymizedAt !== undefined) {
      return { _tag: "Provisioning" } as const;
    }
    const { firstName, email, role, trustedLender } = user.value;
    return { _tag: "Ready", firstName, email, role, trustedLender } as const;
  }),
);

const upsertFromClerk = FunctionImpl.make(
  databaseSchema,
  users,
  "upsertFromClerk",
  ({ clerkId, email, firstName }) =>
    Effect.gen(function* () {
      const writer = yield* DatabaseWriter;
      const existing = yield* findByClerkId(clerkId);

      if (Option.isSome(existing)) {
        // Role and trust are managed in LendLoop, never overwritten by Clerk.
        yield* writer.table("users").patch(existing.value._id, { email, firstName });
        return null;
      }

      const admins = yield* adminEmails;
      yield* writer.table("users").insert({
        clerkId,
        email,
        firstName,
        role: admins.has(email.toLowerCase()) ? "admin" : "user",
        trustedLender: false,
      });
      return null;
    }).pipe(Effect.orDie),
);

const scrubbedEmail = Schema.decodeSync(Email)("deleted@lendloop.invalid");

const anonymize = FunctionImpl.make(databaseSchema, users, "anonymize", ({ clerkId }) =>
  Effect.gen(function* () {
    const writer = yield* DatabaseWriter;
    const existing = yield* findByClerkId(clerkId);
    if (Option.isNone(existing)) return null;

    // Keep the row so loan history stays consistent; drop personal data.
    yield* writer.table("users").patch(existing.value._id, {
      email: scrubbedEmail,
      firstName: "Former neighbor",
      trustedLender: false,
      anonymizedAt: yield* Clock.currentTimeMillis,
    });
    return null;
  }).pipe(Effect.orDie),
);

export default GroupImpl.make(databaseSchema, users).pipe(
  Layer.provide(viewer),
  Layer.provide(upsertFromClerk),
  Layer.provide(anonymize),
  GroupImpl.finalize,
);
