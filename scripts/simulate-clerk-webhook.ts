/**
 * Sends a correctly signed Clerk `user.*` webhook to the local Convex HTTP
 * endpoint, so users can be provisioned without the Clerk dashboard.
 *
 *   bun scripts/simulate-clerk-webhook.ts created user_123 ada@example.com Ada
 *   bun scripts/simulate-clerk-webhook.ts deleted user_123
 *
 * Reads CLERK_WEBHOOK_SECRET and CONVEX_SITE_URL from the environment.
 */
import { Webhook } from "svix";

const [kind, clerkId, email, firstName] = process.argv.slice(2);
const secret = process.env["CLERK_WEBHOOK_SECRET"];
const siteUrl =
  process.env["CONVEX_SITE_URL"] ?? process.env["NEXT_PUBLIC_CONVEX_SITE_URL"];

if (secret === undefined || siteUrl === undefined || clerkId === undefined) {
  console.error("Usage: created|updated|deleted <clerkId> [email] [firstName]");
  console.error("Needs CLERK_WEBHOOK_SECRET and CONVEX_SITE_URL in the environment.");
  process.exit(1);
}

const body = JSON.stringify(
  kind === "deleted"
    ? { type: "user.deleted", data: { id: clerkId, deleted: true } }
    : {
        type: `user.${kind}`,
        data: {
          id: clerkId,
          first_name: firstName ?? null,
          primary_email_address_id: "email_1",
          email_addresses: [
            { id: "email_1", email_address: email, verification: { status: "verified" } },
          ],
        },
      },
);

const messageId = `msg_${crypto.randomUUID()}`;
const timestamp = new Date();
const signature = new Webhook(secret).sign(messageId, timestamp, body);

const response = await fetch(new URL("/webhooks/clerk", siteUrl), {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "svix-id": messageId,
    "svix-timestamp": String(Math.floor(timestamp.getTime() / 1000)),
    "svix-signature": signature,
  },
  body,
});

console.log(response.status, await response.text());
