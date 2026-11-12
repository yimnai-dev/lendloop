#!/usr/bin/env bun
/**
 * Regenerates `n8n/workflows/*.json` from `scripts/n8n/workflows.ts` and the
 * Code-node sources in `n8n/code/`. The output holds no secrets: Code nodes
 * read `$env`, and the Resend key is a credential reference by id.
 *
 *   bun scripts/n8n-build.ts          # write
 *   bun scripts/n8n-build.ts --check  # fail if the committed JSON is stale
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { WORKFLOWS } from "./n8n/workflows";

const outDir = new URL("../n8n/workflows/", import.meta.url);
const check = process.argv.includes("--check");
mkdirSync(outDir, { recursive: true });

let stale = 0;
for (const [file, workflow] of Object.entries(WORKFLOWS)) {
  const target = new URL(file, outDir);
  const json = `${JSON.stringify(workflow, null, 2)}\n`;
  const current = existsSync(target) ? readFileSync(target, "utf8") : "";
  if (current === json) continue;
  if (check) {
    console.error(`stale: n8n/workflows/${file}`);
    stale += 1;
  } else {
    writeFileSync(target, json);
    console.log(`wrote n8n/workflows/${file}`);
  }
}
if (stale > 0) process.exit(1);
