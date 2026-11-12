import type { Document, QueryInitializer } from "@confect/server";
import * as Effect from "effect/Effect";
import { NotFound } from "../../shared/domain/errors";
import type { Id } from "../_generated/id";
import { DatabaseReader } from "../_generated/services";

/** Missing documents become a typed `NotFound`; corrupt ones are defects. */
const orNotFound =
  (entity: NotFound["entity"]) =>
  <A, R>(
    effect: Effect.Effect<
      A,
      QueryInitializer.GetByIdFailure | Document.DocumentDecodeError,
      R
    >,
  ): Effect.Effect<A, NotFound, R> =>
    effect.pipe(
      Effect.catchTags({
        GetByIdFailure: () => Effect.fail(new NotFound({ entity })),
        DocumentDecodeError: (error) => Effect.die(error),
      }),
    );

export const loadTool = (toolId: Id<"tools">) =>
  Effect.flatMap(DatabaseReader, (reader) => reader.table("tools").get(toolId)).pipe(
    orNotFound("tool"),
  );

export const loadLoan = (loanId: Id<"loans">) =>
  Effect.flatMap(DatabaseReader, (reader) => reader.table("loans").get(loanId)).pipe(
    orNotFound("loan"),
  );

export const loadUser = (userId: Id<"users">) =>
  Effect.flatMap(DatabaseReader, (reader) => reader.table("users").get(userId)).pipe(
    orNotFound("user"),
  );
