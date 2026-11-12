// Signs GET /automation/overdue-loans. Env: N8N_TO_CONVEX_SECRET.
const crypto = require("crypto");

const path = "/automation/overdue-loans";
const t = Math.floor(Date.now() / 1000);
const v1 = crypto
  .createHmac("sha256", $env.N8N_TO_CONVEX_SECRET)
  .update(`${t}.GET.${path}.`)
  .digest("hex");

return [{ json: { path, signature: `t=${t},v1=${v1}` } }];
