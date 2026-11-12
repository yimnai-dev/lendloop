import { createHmac } from "node:crypto";
import type * as Mac from "effect/crypto/Mac";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Redacted from "effect/Redacted";
import { describe, expect, it } from "vitest";
import { MacLive, sign, verify, type SignedRequest } from "./signature";

const secret = Redacted.make("test-secret-do-not-use");
const otherSecret = Redacted.make("another-secret");
const now = 1_794_480_000;
const request: SignedRequest = {
  method: "POST",
  path: "/automation/reminders",
  body: '{"reminderKey":"loan:2026-11-12"}',
};

const run = <A, E>(effect: Effect.Effect<A, E, Mac.Mac>) =>
  Effect.runPromiseExit(Effect.provide(effect, MacLive));

const failureReason = async (
  header: string | undefined,
  req: SignedRequest = request,
  at = now,
) => {
  const exit = await run(verify(secret, header, req, at));
  return Exit.isFailure(exit) ? JSON.stringify(exit.cause) : "ok";
};

describe("request signatures", () => {
  it("matches an independent HMAC implementation (what n8n computes)", async () => {
    const header = await Effect.runPromise(
      Effect.provide(sign(secret, request, now), MacLive),
    );
    const expected = createHmac("sha256", Redacted.value(secret))
      .update(`${now}.POST.${request.path}.${request.body}`)
      .digest("hex");
    expect(header).toBe(`t=${now},v1=${expected}`);
  });

  it("accepts its own signature within the tolerance window", async () => {
    const header = await Effect.runPromise(
      Effect.provide(sign(secret, request, now), MacLive),
    );
    expect(await failureReason(header)).toBe("ok");
    expect(await failureReason(header, request, now + 299)).toBe("ok");
  });

  it("rejects tampering with body, path or method", async () => {
    const header = await Effect.runPromise(
      Effect.provide(sign(secret, request, now), MacLive),
    );
    expect(
      await failureReason(header, { ...request, body: `${request.body} ` }),
    ).toContain("mismatch");
    expect(
      await failureReason(header, { ...request, path: "/automation/errors" }),
    ).toContain("mismatch");
    expect(await failureReason(header, { ...request, method: "GET" })).toContain(
      "mismatch",
    );
  });

  it("rejects a signature made with another secret", async () => {
    const header = await Effect.runPromise(
      Effect.provide(sign(otherSecret, request, now), MacLive),
    );
    expect(await failureReason(header)).toContain("mismatch");
  });

  it("rejects stale and future timestamps (replay window)", async () => {
    const header = await Effect.runPromise(
      Effect.provide(sign(secret, request, now), MacLive),
    );
    expect(await failureReason(header, request, now + 301)).toContain("stale");
    expect(await failureReason(header, request, now - 301)).toContain("stale");
  });

  it.each([
    ["missing", undefined],
    ["missing", ""],
    ["malformed", "v1=abc"],
    ["malformed", `t=${now},v1=nothex`],
    ["malformed", `t=${now},v1=${"a".repeat(63)}`],
  ])("rejects a %s header (%s)", async (reason, header) => {
    expect(await failureReason(header)).toContain(reason);
  });
});
