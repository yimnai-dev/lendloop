import * as Clock from "effect/Clock";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import refs from "../_generated/refs";
import { DatabaseReader, DatabaseWriter, Scheduler } from "../_generated/services";

const REDRIVE_BATCH = 100;

/**
 * Re-queues dead notifications after the cause is fixed. The eventId doubles
 * as the email Idempotency-Key, so a redriven event never emails twice.
 */
export const redriveDead = Effect.gen(function* () {
  const reader = yield* DatabaseReader;
  const writer = yield* DatabaseWriter;
  const scheduler = yield* Scheduler;
  const now = yield* Clock.currentTimeMillis;
  const dead = yield* reader
    .table("outboxEvents")
    .index("by_status_nextAttemptAt", (q) => q.eq("status", "dead"))
    .take(REDRIVE_BATCH);

  yield* Effect.forEach(dead, (row) =>
    Effect.andThen(
      writer
        .table("outboxEvents")
        .patch(row._id, { status: "pending", attempts: 0, nextAttemptAt: now }),
      scheduler.runAfter(Duration.zero, refs.internal.outbox.dispatch, {
        outboxId: row._id,
      }),
    ),
  );
  return dead.length;
}).pipe(Effect.orDie);
