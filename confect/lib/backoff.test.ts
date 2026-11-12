import { describe, expect, it } from "vitest";
import { nextAttemptDelay } from "./backoff";

describe("outbox backoff", () => {
  it("doubles per attempt and caps at one hour", () => {
    expect(nextAttemptDelay(1, 0)).toBe(30_000);
    expect(nextAttemptDelay(2, 0)).toBe(60_000);
    expect(nextAttemptDelay(5, 0)).toBe(480_000);
    expect(nextAttemptDelay(20, 0)).toBe(3_600_000);
  });

  it("adds at most 20% jitter", () => {
    expect(nextAttemptDelay(1, 1)).toBe(36_000);
    expect(nextAttemptDelay(1, 0.5)).toBe(33_000);
  });
});
