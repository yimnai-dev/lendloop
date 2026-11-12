import { FunctionImpl, GroupImpl } from "@confect/server";
import * as Clock from "effect/Clock";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import { addDays } from "../shared/domain/IsoDate";
import { Email } from "../shared/domain/User";
import * as Schema from "effect/Schema";
import type { Id } from "./_generated/id";
import databaseSchema from "./_generated/schema";
import { DatabaseReader, DatabaseWriter } from "./_generated/services";
import { syncOwnerTrust } from "./lib/ownerTrust";
import { appToday } from "./lib/today";
import seed from "./seed.spec";
import { SEED_LOANS, SEED_TOOLS, SEED_USERS, type SeedUserKey } from "./seed/data";

const DAY_MS = 86_400_000;
const decodeEmail = Schema.decodeSync(Email);
const clerkIdFor = (key: SeedUserKey) => `seed_${key}`;

/**
 * Idempotent: does nothing once the first seed user exists. Writes rows
 * directly (no outbox), so seeding never sends email.
 */
const demo = FunctionImpl.make(databaseSchema, seed, "demo", () =>
  Effect.gen(function* () {
    const reader = yield* DatabaseReader;
    const writer = yield* DatabaseWriter;
    const existing = yield* reader
      .table("users")
      .index("by_clerkId", (q) => q.eq("clerkId", clerkIdFor(SEED_USERS[0].key)))
      .first();
    if (Option.isSome(existing)) return { created: false, users: 0, tools: 0, loans: 0 };

    const today = yield* appToday;
    const now = yield* Clock.currentTimeMillis;

    const userIds = new Map<SeedUserKey, Id<"users">>();
    for (const user of SEED_USERS) {
      const id = yield* writer.table("users").insert({
        clerkId: clerkIdFor(user.key),
        email: decodeEmail(`${user.key}@seed.lendloop.test`),
        firstName: user.firstName,
        role: "user",
        trustedLender: user.trustedLender,
      });
      userIds.set(user.key, id);
    }
    const userId = (key: SeedUserKey) =>
      Option.getOrThrow(Option.fromNullishOr(userIds.get(key)));

    const tools = new Map<string, { id: Id<"tools">; ownerId: Id<"users"> }>();
    for (const { key, owner, ...fields } of SEED_TOOLS) {
      const ownerId = userId(owner);
      const id = yield* writer.table("tools").insert({
        ...fields,
        ownerId,
        photoIds: [],
        archived: false,
        ownerTrusted: SEED_USERS.some((u) => u.key === owner && u.trustedLender),
      });
      tools.set(key, { id, ownerId });
    }

    for (const loan of SEED_LOANS) {
      const tool = Option.getOrThrow(Option.fromNullishOr(tools.get(loan.tool)));
      const decided = loan.status !== "pending";
      yield* writer.table("loans").insert({
        toolId: tool.id,
        lenderId: tool.ownerId,
        borrowerId: userId(loan.borrower),
        startDate: addDays(today, loan.start),
        endDate: addDays(today, loan.end),
        status: loan.status,
        ...(decided ? { decidedAt: now + (loan.start - 2) * DAY_MS } : {}),
        ...(loan.status === "returned" ? { returnedAt: now + loan.end * DAY_MS } : {}),
      });
    }
    return {
      created: true,
      users: SEED_USERS.length,
      tools: SEED_TOOLS.length,
      loans: SEED_LOANS.length,
    };
  }).pipe(Effect.orDie),
);

const backfillOwnerTrust = FunctionImpl.make(
  databaseSchema,
  seed,
  "backfillOwnerTrust",
  () =>
    Effect.gen(function* () {
      const users = yield* (yield* DatabaseReader)
        .table("users")
        .index("by_creation_time")
        .collect();
      yield* Effect.forEach(
        users,
        (user) => syncOwnerTrust(user._id, user.trustedLender),
        {
          discard: true,
        },
      );
      return { owners: users.length };
    }).pipe(Effect.orDie),
);

export default GroupImpl.make(databaseSchema, seed).pipe(
  Layer.provide(demo),
  Layer.provide(backfillOwnerTrust),
  GroupImpl.finalize,
);
