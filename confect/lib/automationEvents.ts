import * as Clock from "effect/Clock";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import type { Id } from "../_generated/id";
import { DatabaseReader, DatabaseWriter } from "../_generated/services";
import type automationEvents from "../_generated/tables/automationEvents";

type AutomationEvent = {
  readonly idempotencyKey: string;
  readonly kind: (typeof automationEvents.Doc.Type)["kind"];
  readonly loanId?: Id<"loans">;
  readonly detail?: string;
};

/**
 * Inserts the event unless one with the same idempotency key exists. Convex
 * mutations are serializable, so check-then-insert can't race.
 */
export const recordAutomationEvent = Effect.fn("recordAutomationEvent")(function* (
  event: AutomationEvent,
) {
  const reader = yield* DatabaseReader;
  const writer = yield* DatabaseWriter;
  const existing = yield* reader
    .table("automationEvents")
    .index("by_idempotencyKey", (q) => q.eq("idempotencyKey", event.idempotencyKey))
    .first()
    .pipe(Effect.orDie);
  if (Option.isSome(existing)) return { duplicate: true } as const;

  const at = yield* Clock.currentTimeMillis;
  yield* writer
    .table("automationEvents")
    .insert({ ...event, at })
    .pipe(Effect.orDie);
  return { duplicate: false } as const;
});
