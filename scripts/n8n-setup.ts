#!/usr/bin/env bun
/**
 * One-shot n8n setup against the running compose stack:
 *   1. imports the "Resend API" Header Auth credential from RESEND_API_KEY
 *      (piped over stdin, written to a container temp file, imported, deleted);
 *   2. imports the three workflows from n8n/workflows (stable ids, so re-running updates them);
 *   3. publishes the two triggered workflows and restarts n8n so they go live.
 *
 *   RESEND_API_KEY=re_xxx bun scripts/n8n-setup.ts
 *
 * Without RESEND_API_KEY a placeholder is used, which the local resendev accepts.
 */
import { execFileSync } from "node:child_process";
import { RESEND_CREDENTIAL } from "./n8n/nodes";
import { WORKFLOW_IDS } from "./n8n/workflows";

const apiKey = process.env["RESEND_API_KEY"] ?? "re_local_resendev";
if (process.env["RESEND_API_KEY"] === undefined) {
  console.warn("RESEND_API_KEY not set; using a placeholder (fine for resendev)");
}

const credential = [
  {
    id: RESEND_CREDENTIAL.httpHeaderAuth.id,
    name: RESEND_CREDENTIAL.httpHeaderAuth.name,
    type: "httpHeaderAuth",
    data: { name: "Authorization", value: `Bearer ${apiKey}` },
  },
];

const exec = (script: string, stdin = "") =>
  execFileSync("docker", ["compose", "exec", "-T", "n8n", "sh", "-c", script], {
    input: stdin,
    stdio: ["pipe", "inherit", "inherit"],
  });

exec(
  "umask 077; f=$(mktemp); cat > $f; n8n import:credentials --input=$f; s=$?; rm -f $f; exit $s",
  JSON.stringify(credential),
);
exec("n8n import:workflow --separate --input=/lendloop/workflows");
for (const id of [WORKFLOW_IDS.notify, WORKFLOW_IDS.overdue]) {
  exec(`n8n publish:workflow --id=${id}`);
}

console.log("n8n ready: http://localhost:5678 (webhook: /webhook/lendloop-notify)");
