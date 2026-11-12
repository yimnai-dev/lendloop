import { FunctionImpl, GroupImpl } from "@confect/server";
import * as Clock from "effect/Clock";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Random from "effect/Random";
import refs from "./_generated/refs";
import databaseSchema from "./_generated/schema";
import {
  DatabaseReader,
  DatabaseWriter,
  MutationRunner,
  QueryRunner,
  Scheduler,
} from "./_generated/services";
import { recordAutomationEvent } from "./lib/automationEvents";
import { MAX_DELIVERY_ATTEMPTS, nextAttemptDelay } from "./lib/backoff";
import outbox from "./outbox.spec";
import { redriveDead } from "./outbox/redrive";
import { N8nNotifier } from "./services/N8nNotifier";

/** A dispatch that hasn't reported back after this long is considered lost. */
const STUCK_AFTER_MS = 2 * 60_000;
const SWEEP_BATCH = 50;

const load = FunctionImpl.make(databaseSchema, outbox, "load", ({ outboxId }) =>
  Effect.flatMap(DatabaseReader, (reader) =>
    reader.table("outboxEvents").get(outboxId),
  ).pipe(
    Effect.catchTag("GetByIdFailure", () => Effect.succeed(null)),
    Effect.orDie,
  ),
);

const dispatch = FunctionImpl.make(databaseSchema, outbox, "dispatch", ({ outboxId }) =>
  Effect.gen(function* () {
    const { runQuery } = yield* QueryRunner;
    const { runMutation } = yield* MutationRunner;
    const notifier = yield* N8nNotifier;

    const row = yield* runQuery(refs.internal.outbox.load, { outboxId });
    if (row === null || row.status !== "pending") return null;

    yield* notifier.notify(row.payload).pipe(
      Effect.matchEffect({
        onSuccess: () => runMutation(refs.internal.outbox.recordSuccess, { outboxId }),
        onFailure: (error) =>
          Effect.andThen(
            Effect.logWarning("Outbox delivery failed", row.eventId, error.message),
            runMutation(refs.internal.outbox.recordFailure, {
              outboxId,
              error: error.message,
            }),
          ),
      }),
    );
    return null;
  }).pipe(Effect.provide(N8nNotifier.layer), Effect.orDie),
);

const recordSuccess = FunctionImpl.make(
  databaseSchema,
  outbox,
  "recordSuccess",
  ({ outboxId }) =>
    Effect.gen(function* () {
      const reader = yield* DatabaseReader;
      const writer = yield* DatabaseWriter;
      const row = yield* reader.table("outboxEvents").get(outboxId);
      if (row.status !== "pending") return null;

      yield* writer.table("outboxEvents").patch(outboxId, {
        status: "delivered",
        deliveredAt: yield* Clock.currentTimeMillis,
      });
      yield* recordAutomationEvent({
        idempotencyKey: `outbox:${row.eventId}`,
        kind: "notification_delivered",
        loanId: row.loanId,
        detail: row.payload.type,
      });
      return null;
    }).pipe(Effect.orDie),
);

const recordFailure = FunctionImpl.make(
  databaseSchema,
  outbox,
  "recordFailure",
  ({ outboxId, error }) =>
    Effect.gen(function* () {
      const reader = yield* DatabaseReader;
      const writer = yield* DatabaseWriter;
      const scheduler = yield* Scheduler;
      const row = yield* reader.table("outboxEvents").get(outboxId);
      if (row.status !== "pending") return null;

      const attempts = row.attempts + 1;
      if (attempts >= MAX_DELIVERY_ATTEMPTS) {
        yield* writer
          .table("outboxEvents")
          .patch(outboxId, { status: "dead", attempts, lastError: error });
        yield* recordAutomationEvent({
          idempotencyKey: `outbox:${row.eventId}:dead`,
          kind: "notification_dead",
          loanId: row.loanId,
          detail: `${row.payload.type}: ${error}`,
        });
        return null;
      }

      const delay = nextAttemptDelay(attempts, yield* Random.next);
      const now = yield* Clock.currentTimeMillis;
      yield* writer
        .table("outboxEvents")
        .patch(outboxId, { attempts, lastError: error, nextAttemptAt: now + delay });
      yield* scheduler.runAfter(Duration.millis(delay), refs.internal.outbox.dispatch, {
        outboxId,
      });
      return null;
    }).pipe(Effect.orDie),
);

/** Safety net: re-dispatch pending rows whose scheduled run was lost. */
const sweep = FunctionImpl.make(databaseSchema, outbox, "sweep", () =>
  Effect.gen(function* () {
    const reader = yield* DatabaseReader;
    const scheduler = yield* Scheduler;
    const now = yield* Clock.currentTimeMillis;
    const stuck = yield* reader
      .table("outboxEvents")
      .index("by_status_nextAttemptAt", (q) =>
        q.eq("status", "pending").lt("nextAttemptAt", now - STUCK_AFTER_MS),
      )
      .take(SWEEP_BATCH);

    yield* Effect.forEach(stuck, (row) =>
      scheduler.runAfter(Duration.zero, refs.internal.outbox.dispatch, {
        outboxId: row._id,
      }),
    );
    if (stuck.length > 0)
      yield* Effect.logInfo("Outbox sweep re-dispatched", stuck.length);
    return null;
  }).pipe(Effect.orDie),
);

const redrive = FunctionImpl.make(databaseSchema, outbox, "redrive", () => redriveDead);

export default GroupImpl.make(databaseSchema, outbox).pipe(
  Layer.provide(load),
  Layer.provide(dispatch),
  Layer.provide(recordSuccess),
  Layer.provide(recordFailure),
  Layer.provide(sweep),
  Layer.provide(redrive),
  GroupImpl.finalize,
);
