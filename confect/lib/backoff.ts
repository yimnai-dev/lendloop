/**
 * Durable retry schedule for outbox deliveries, used between dispatcher runs
 * (each run also retries transient failures in-process first).
 */
export const MAX_DELIVERY_ATTEMPTS = 6;

const BASE_DELAY_MS = 30_000;
const MAX_DELAY_MS = 60 * 60_000;

/** 30s, 1m, 2m, 4m, 8m … capped at 1h, with up to 20% jitter. */
export const nextAttemptDelay = (attempts: number, random: number): number => {
  const exponential = Math.min(
    BASE_DELAY_MS * 2 ** Math.max(0, attempts - 1),
    MAX_DELAY_MS,
  );
  return Math.round(exponential * (1 + 0.2 * random));
};
