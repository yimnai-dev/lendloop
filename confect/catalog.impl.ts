import { FunctionImpl, GroupImpl } from "@confect/server";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import databaseSchema from "./_generated/schema";
import { DatabaseReader } from "./_generated/services";
import catalog from "./catalog.spec";

const PUBLIC_LIMIT = 200;

const publicList = FunctionImpl.make(databaseSchema, catalog, "publicList", () =>
  Effect.gen(function* () {
    const reader = yield* DatabaseReader;
    const tools = yield* reader
      .table("tools")
      .index("by_archived_category", (q) => q.eq("archived", false))
      .take(PUBLIC_LIMIT);
    // Explicit projection: nothing about owners, conditions or photos leaks.
    return tools
      .map(({ name, category }) => ({ name, category }))
      .toSorted((a, b) => a.name.localeCompare(b.name));
  }).pipe(Effect.orDie),
);

export default GroupImpl.make(databaseSchema, catalog).pipe(
  Layer.provide(publicList),
  GroupImpl.finalize,
);
