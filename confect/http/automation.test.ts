import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { todayIn } from "../../shared/domain/IsoDate";
import { AUTOMATION_PATHS, reminderKey } from "../../shared/integration/automation";
import { MacLive, SIGNATURE_HEADER, sign } from "../../shared/integration/signature";
import { makeTest, type TestApp } from "../test/harness";

const SECRET = "automation-endpoint-test-secret";
let app: TestApp;

const signedFetch = async (
  method: "GET" | "POST",
  path: string,
  body = "",
  secret = SECRET,
) => {
  const signature = await Effect.runPromise(
    sign(
      Redacted.make(secret),
      { method, path, body },
      Math.floor(Date.now() / 1000),
    ).pipe(Effect.provide(MacLive)),
  );
  return app.t.fetch(path, {
    method,
    headers: { [SIGNATURE_HEADER]: signature, "content-type": "application/json" },
    ...(method === "POST" ? { body } : {}),
  });
};

beforeEach(() => {
  vi.stubEnv("N8N_TO_CONVEX_SECRET", SECRET);
  app = makeTest();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("n8n → Convex automation API", () => {
  it("rejects unsigned and wrongly signed requests without saying why", async () => {
    const unsigned = await app.t.fetch(AUTOMATION_PATHS.overdueLoans);
    expect(unsigned.status).toBe(401);
    expect(await unsigned.text()).toBe("Unauthorized");
    const wrong = await signedFetch(
      "GET",
      AUTOMATION_PATHS.overdueLoans,
      "",
      "not-the-secret",
    );
    expect(wrong.status).toBe(401);
  });

  it("serves the overdue list to a correctly signed request", async () => {
    const response = await signedFetch("GET", AUTOMATION_PATHS.overdueLoans);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ reminders: [] });
  });

  it("records write-backs idempotently and rejects malformed ones", async () => {
    const body = JSON.stringify({
      reminderKey: reminderKey("a".repeat(32), todayIn("UTC", Date.now())),
      status: "sent",
    });
    const first = await signedFetch("POST", AUTOMATION_PATHS.reminders, body);
    const second = await signedFetch("POST", AUTOMATION_PATHS.reminders, body);
    expect(await first.json()).toEqual({ duplicate: false });
    expect(await second.json()).toEqual({ duplicate: true });

    const bad = await signedFetch(
      "POST",
      AUTOMATION_PATHS.reminders,
      '{"reminderKey":"x"}',
    );
    expect(bad.status).toBe(400);
  });
});
