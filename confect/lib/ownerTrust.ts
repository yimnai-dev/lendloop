import * as Effect from "effect/Effect";
import type { Id } from "../_generated/id";
import { DatabaseReader, DatabaseWriter } from "../_generated/services";

/** Copies a user's Trusted Lender flag onto every tool they own (see `tools.ownerTrusted`). */
export const syncOwnerTrust = Effect.fn("syncOwnerTrust")(function* (
  ownerId: Id<"users">,
  trusted: boolean,
) {
  const reader = yield* DatabaseReader;
  const writer = yield* DatabaseWriter;
  const owned = yield* reader
    .table("tools")
    .index("by_owner", (q) => q.eq("ownerId", ownerId))
    .collect();
  yield* Effect.forEach(
    owned.filter((tool) => tool.ownerTrusted !== trusted),
    (tool) => writer.table("tools").patch(tool._id, { ownerTrusted: trusted }),
    { discard: true },
  );
});
