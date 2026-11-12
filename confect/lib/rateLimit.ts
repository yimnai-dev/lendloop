import { HOUR, RateLimiter } from "@convex-dev/rate-limiter";
import * as Effect from "effect/Effect";
import { RateLimited } from "../../shared/domain/errors";
import { components } from "../_generated/components";
import { MutationCtx } from "../_generated/services";

const limiter = new RateLimiter(components.rateLimiter, {
  requestLoan: { kind: "token bucket", rate: 10, period: HOUR, capacity: 10 },
  createTool: { kind: "token bucket", rate: 20, period: 24 * HOUR, capacity: 20 },
});

export type RateLimitName = "requestLoan" | "createTool";

/** Consumes one token for `key`, failing with `RateLimited` when exhausted. */
export const consumeRateLimit = Effect.fn("consumeRateLimit")(function* (
  name: RateLimitName,
  key: string,
) {
  const ctx = yield* MutationCtx;
  const status = yield* Effect.promise(() => limiter.limit(ctx, name, { key }));
  if (!status.ok) {
    return yield* new RateLimited({ retryAfterMs: status.retryAfter });
  }
});
