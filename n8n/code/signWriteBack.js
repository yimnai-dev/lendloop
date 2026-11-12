// Runs once per item. Signs the reminder write-back for POST /automation/reminders.
// STATUS is replaced at build time ("sent" or "failed"). Env: N8N_TO_CONVEX_SECRET.
const crypto = require("crypto");

const STATUS = "__STATUS__";
const path = "/automation/reminders";
const { reminderKey } = $("Split reminders").item.json;
const detail = STATUS === "failed" ? String($json.error?.message ?? "send failed").slice(0, 500) : undefined;
const body = JSON.stringify(detail === undefined ? { reminderKey, status: STATUS } : { reminderKey, status: STATUS, detail });
const t = Math.floor(Date.now() / 1000);
const v1 = crypto
  .createHmac("sha256", $env.N8N_TO_CONVEX_SECRET)
  .update(`${t}.POST.${path}.${body}`)
  .digest("hex");

return { json: { path, body, signature: `t=${t},v1=${v1}` } };
