/**
 * Calls a signed /automation/* endpoint the way n8n does. Dev and debugging only.
 *
 *   N8N_TO_CONVEX_SECRET=... CONVEX_SITE_URL=http://127.0.0.1:3211 \
 *     bun scripts/automation-call.ts GET /automation/overdue-loans
 *   bun scripts/automation-call.ts POST /automation/reminders '{"reminderKey":"…","status":"sent"}'
 */
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import { MacLive, SIGNATURE_HEADER, sign } from "../shared/integration/signature";

const [method = "GET", path = "/automation/overdue-loans", body = ""] =
  process.argv.slice(2);
const secret = process.env.N8N_TO_CONVEX_SECRET;
const site = process.env.CONVEX_SITE_URL ?? "http://127.0.0.1:3211";
if (secret === undefined) throw new Error("Set N8N_TO_CONVEX_SECRET");

const signature = await Effect.runPromise(
  sign(Redacted.make(secret), { method, path, body }, Math.floor(Date.now() / 1000)).pipe(
    Effect.provide(MacLive),
  ),
);
const response = await fetch(new URL(path, site), {
  method,
  headers: { [SIGNATURE_HEADER]: signature, "content-type": "application/json" },
  ...(method === "GET" ? {} : { body }),
});
console.log(response.status, await response.text());
