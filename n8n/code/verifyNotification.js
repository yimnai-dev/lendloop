// Verifies Convex's HMAC over the raw body before anything is parsed.
// Env: CONVEX_TO_N8N_SECRET. Header: x-lendloop-signature: t=<unix>,v1=<hex>.
const crypto = require("crypto");

const PATH = "/webhook/lendloop-notify";
const TOLERANCE_SECONDS = 300;

const item = $input.first();
const raw = (await this.helpers.getBinaryDataBuffer(0, "data")).toString("utf8");
const header = String(item.json.headers["x-lendloop-signature"] ?? "").trim();
const match = /^t=(\d{1,12}),v1=([0-9a-f]{64})$/.exec(header);
const now = Math.floor(Date.now() / 1000);

let valid = false;
if (match !== null && Math.abs(now - Number(match[1])) <= TOLERANCE_SECONDS) {
  const expected = crypto
    .createHmac("sha256", $env.CONVEX_TO_N8N_SECRET)
    .update(`${match[1]}.POST.${PATH}.${raw}`)
    .digest();
  const given = Buffer.from(match[2], "hex");
  valid = given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

return [{ json: valid ? { valid: true, payload: JSON.parse(raw) } : { valid: false } }];
