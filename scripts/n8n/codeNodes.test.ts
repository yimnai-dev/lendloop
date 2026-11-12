import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import { createRequire } from "node:module";
import * as vm from "node:vm";
import { describe, expect, it } from "vitest";
import { MacLive, sign, verify } from "../../shared/integration/signature";
import { ReminderResult, WorkflowError } from "../../shared/integration/automation";
import { readCode } from "./nodes";

/**
 * Runs the real n8n Code-node sources with a minimal stand-in for n8n's
 * globals, then checks their signatures against the server-side verifier.
 */
const SECRET = "n8n-code-node-test-secret";
const nodeRequire = createRequire(import.meta.url);
type Item = { json: Record<string, unknown> };
type Globals = {
  readonly items?: ReadonlyArray<Item>;
  readonly json?: Record<string, unknown>;
  readonly named?: Record<string, Item>;
  readonly rawBody?: string;
};

/** Like n8n, wraps the source in an async function and runs it in its own V8 context. */
const run = async (
  file: string,
  globals: Globals,
  replace: Record<string, string> = {},
) => {
  const source = Object.entries(replace).reduce(
    (s, [a, b]) => s.replaceAll(a, b),
    readCode(file),
  );
  const items = globals.items ?? [];
  const sandbox = {
    Buffer,
    require: nodeRequire,
    $input: { first: () => items[0], all: () => items },
    $env: {
      CONVEX_TO_N8N_SECRET: SECRET,
      N8N_TO_CONVEX_SECRET: SECRET,
      EMAIL_FROM: "LendLoop <loans@lendloop.test>",
      APP_URL: "http://app.test",
    },
    $json: globals.json ?? {},
    $: (name: string) => ({ item: globals.named?.[name] }),
    self: {
      helpers: { getBinaryDataBuffer: async () => Buffer.from(globals.rawBody ?? "") },
    },
  };
  const script = `(async function () {${source}\n}).call(self)`;
  const result: unknown = await vm.runInNewContext(script, sandbox);
  return result;
};

const Signed = Schema.Struct({
  path: Schema.String,
  signature: Schema.String,
  body: Schema.optionalKey(Schema.String),
});
const Output = Schema.Struct({ json: Schema.Unknown });
/** Run-once nodes return an item array; per-item nodes return one item. */
const firstJson = (output: unknown) => {
  const items = Schema.decodeUnknownSync(
    Schema.Union([Schema.NonEmptyArray(Output), Output]),
  )(output);
  return "json" in items ? items.json : items[0].json;
};
const firstSigned = (output: unknown) =>
  Schema.decodeUnknownSync(Signed)(firstJson(output));

const verifies = async (method: string, signed: typeof Signed.Type) => {
  const exit = await Effect.runPromiseExit(
    verify(
      Redacted.make(SECRET),
      signed.signature,
      { method, path: signed.path, body: signed.body ?? "" },
      Math.floor(Date.now() / 1000),
    ).pipe(Effect.provide(MacLive)),
  );
  return Exit.isSuccess(exit);
};

const payload = {
  eventId: "evt-1",
  type: "request_created",
  recipient: { email: "ada@example.test", firstName: "Ada" },
  tool: { name: "Drill" },
  loan: { startDate: "2026-11-13", endDate: "2026-11-15", status: "pending" },
};

describe("n8n Code nodes", () => {
  it("verifyNotification accepts a Convex signature and rejects a tampered body", async () => {
    const body = JSON.stringify(payload);
    const header = await Effect.runPromise(
      sign(
        Redacted.make(SECRET),
        { method: "POST", path: "/webhook/lendloop-notify", body },
        Math.floor(Date.now() / 1000),
      ).pipe(Effect.provide(MacLive)),
    );
    const items = [{ json: { headers: { "x-lendloop-signature": header } } }];
    expect(await run("verifyNotification.js", { items, rawBody: body })).toEqual([
      { json: { valid: true, payload } },
    ]);
    expect(
      await run("verifyNotification.js", { items, rawBody: body.replace("Ada", "Eve") }),
    ).toEqual([{ json: { valid: false } }]);
    expect(
      await run("verifyNotification.js", {
        items: [{ json: { headers: {} } }],
        rawBody: body,
      }),
    ).toEqual([{ json: { valid: false } }]);
  });

  it("buildNotificationEmail keys the email by event id", async () => {
    const out = firstJson(
      await run("buildNotificationEmail.js", { items: [{ json: { payload } }] }),
    );
    expect(out).toMatchObject({
      idempotencyKey: "evt-1",
      email: { to: ["ada@example.test"], subject: "New request for your Drill" },
    });
  });

  it("signOverdueRequest signs an empty-body GET", async () => {
    const signed = firstSigned(await run("signOverdueRequest.js", {}));
    expect(signed.path).toBe("/automation/overdue-loans");
    expect(await verifies("GET", signed)).toBe(true);
  });

  it.each(["sent", "failed"])("signWriteBack signs a valid %s result", async (status) => {
    const reminderKey = `${"a".repeat(32)}:2026-11-12`;
    const signed = firstSigned(
      await run(
        "signWriteBack.js",
        {
          json: { error: { message: "boom" } },
          named: { "Split reminders": { json: { reminderKey } } },
        },
        { __STATUS__: status },
      ),
    );
    expect(await verifies("POST", signed)).toBe(true);
    const result = Schema.decodeUnknownSync(Schema.fromJsonString(ReminderResult))(
      signed.body,
    );
    expect(result).toEqual(
      status === "sent"
        ? { reminderKey, status }
        : { reminderKey, status, detail: "boom" },
    );
  });

  it("signWorkflowError produces a body the errors endpoint accepts", async () => {
    const signed = firstSigned(
      await run("signWorkflowError.js", {
        items: [
          {
            json: {
              execution: {
                id: "42",
                lastNodeExecuted: "Fetch overdue loans",
                error: { message: "timeout" },
              },
              workflow: { name: "LendLoop · Daily overdue reminders" },
            },
          },
        ],
      }),
    );
    expect(await verifies("POST", signed)).toBe(true);
    expect(
      Schema.decodeUnknownSync(Schema.fromJsonString(WorkflowError))(signed.body),
    ).toEqual({
      executionId: "42",
      workflow: "LendLoop · Daily overdue reminders",
      node: "Fetch overdue loans",
      message: "timeout",
    });
  });
});
