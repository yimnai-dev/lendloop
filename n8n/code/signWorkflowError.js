// Signs the error report for POST /automation/errors. Env: N8N_TO_CONVEX_SECRET.
const crypto = require("crypto");

const { execution = {}, workflow = {}, trigger } = $input.first().json;
const path = "/automation/errors";
const report = {
  executionId: String(execution.id ?? `trigger-${Date.now()}`),
  workflow: String(workflow.name ?? "unknown").slice(0, 200),
  ...(execution.lastNodeExecuted ? { node: String(execution.lastNodeExecuted).slice(0, 200) } : {}),
  message: String(execution.error?.message ?? trigger?.error?.message ?? "Unknown error").slice(0, 2000),
};
const body = JSON.stringify(report);
const t = Math.floor(Date.now() / 1000);
const v1 = crypto
  .createHmac("sha256", $env.N8N_TO_CONVEX_SECRET)
  .update(`${t}.POST.${path}.${body}`)
  .digest("hex");

return [{ json: { path, body, signature: `t=${t},v1=${v1}` } }];
