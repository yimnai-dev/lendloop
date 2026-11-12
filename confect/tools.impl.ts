import { FunctionImpl, GroupImpl } from "@confect/server";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import databaseSchema from "./_generated/schema";
import { DatabaseReader, DatabaseWriter, StorageWriter } from "./_generated/services";
import { NotFound } from "../shared/domain/errors";
import { consumeRateLimit } from "./lib/rateLimit";
import { deleteQuietly, validatePhotos } from "./lib/photos";
import { toToolCard } from "./lib/views";
import { archiveTool } from "./loans/archiveTool";
import { loansForTool } from "./loans/queries";
import { CurrentUser } from "./middleware/RequireUser.spec";
import RequireUserImpl from "./middleware/RequireUser.impl";
import { requireOwnTool, requireVisibleTool } from "./policies/access";
import tools from "./tools.spec";

const BROWSE_LIMIT = 200;

const browse = FunctionImpl.make(
  databaseSchema,
  tools,
  "browse",
  ({ category, trustedOnly }) =>
    Effect.gen(function* () {
      const { user } = yield* CurrentUser;
      const reader = yield* DatabaseReader;
      const docs = yield* reader
        .table("tools")
        .index("by_archived_category", (q) =>
          category === undefined
            ? q.eq("archived", false)
            : q.eq("archived", false).eq("category", category),
        )
        .take(BROWSE_LIMIT);

      const cards = yield* Effect.forEach(docs, (tool) => toToolCard(tool, user._id));
      // Trusted lenders first, then alphabetical.
      return cards
        .filter((card) => !trustedOnly || card.owner.trustedLender)
        .toSorted(
          (a, b) =>
            Number(b.owner.trustedLender) - Number(a.owner.trustedLender) ||
            a.name.localeCompare(b.name),
        );
    }).pipe(Effect.orDie),
);

const get = FunctionImpl.make(databaseSchema, tools, "get", ({ toolId }) =>
  Effect.gen(function* () {
    const { user } = yield* CurrentUser;
    const tool = yield* requireVisibleTool(toolId);
    const pending = yield* loansForTool(tool._id, "pending");
    const mine = pending.find((loan) => loan.borrowerId === user._id);
    return {
      tool: yield* toToolCard(tool, user._id).pipe(Effect.orDie),
      myPendingRequest:
        mine === undefined
          ? null
          : { loanId: mine._id, startDate: mine.startDate, endDate: mine.endDate },
    };
  }),
);

const myListings = FunctionImpl.make(databaseSchema, tools, "myListings", () =>
  Effect.gen(function* () {
    const { user } = yield* CurrentUser;
    const reader = yield* DatabaseReader;
    const docs = yield* reader
      .table("tools")
      .index("by_owner", (q) => q.eq("ownerId", user._id).eq("archived", false))
      .collect();
    return yield* Effect.forEach(docs, (tool) =>
      Effect.all({
        tool: toToolCard(tool, user._id),
        pendingRequests: Effect.map(loansForTool(tool._id, "pending"), (l) => l.length),
      }),
    );
  }).pipe(Effect.orDie),
);

const generateUploadUrl = FunctionImpl.make(
  databaseSchema,
  tools,
  "generateUploadUrl",
  () =>
    Effect.flatMap(StorageWriter, (storage) => storage.generateUploadUrl).pipe(
      Effect.map((url) => url.toString()),
      Effect.orDie,
    ),
);

const create = FunctionImpl.make(databaseSchema, tools, "create", (fields) =>
  Effect.gen(function* () {
    const { user } = yield* CurrentUser;
    yield* consumeRateLimit("createTool", user._id);
    yield* validatePhotos(fields.photoIds);
    const writer = yield* DatabaseWriter;
    return yield* writer
      .table("tools")
      .insert({ ...fields, ownerId: user._id, archived: false })
      .pipe(Effect.orDie);
  }),
);

const update = FunctionImpl.make(
  databaseSchema,
  tools,
  "update",
  ({ toolId, ...fields }) =>
    Effect.gen(function* () {
      const tool = yield* requireOwnTool(toolId);
      if (tool.archived) return yield* new NotFound({ entity: "tool" });
      yield* validatePhotos(fields.photoIds);

      const writer = yield* DatabaseWriter;
      yield* writer.table("tools").patch(tool._id, fields).pipe(Effect.orDie);
      const removed = tool.photoIds.filter((id) => !fields.photoIds.includes(id));
      yield* Effect.forEach(removed, deleteQuietly);
      return null;
    }),
);

const archive = FunctionImpl.make(databaseSchema, tools, "archive", ({ toolId }) =>
  Effect.gen(function* () {
    const tool = yield* requireOwnTool(toolId);
    yield* archiveTool(tool);
    return null;
  }),
);

export default GroupImpl.make(databaseSchema, tools).pipe(
  Layer.provide(browse),
  Layer.provide(get),
  Layer.provide(myListings),
  Layer.provide(generateUploadUrl),
  Layer.provide(create),
  Layer.provide(update),
  Layer.provide(archive),
  Layer.provide(RequireUserImpl),
  GroupImpl.finalize,
);
