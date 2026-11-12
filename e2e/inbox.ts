import { expect } from "@playwright/test";
import * as Schema from "effect/Schema";

const RESENDEV_URL = process.env["RESENDEV_URL"] ?? "http://localhost:3099";

const Inbox = Schema.Struct({
  data: Schema.Array(
    Schema.Struct({ to: Schema.Array(Schema.String), subject: Schema.String }),
  ),
});
const decodeInbox = Schema.decodeUnknownSync(Inbox);

const subjectsFor = async (email: string) => {
  const response = await fetch(`${RESENDEV_URL}/api/emails`);
  const { data } = decodeInbox(await response.json());
  return data.filter((mail) => mail.to.includes(email)).map((mail) => mail.subject);
};

/** Waits for the Convex outbox → n8n → resendev hop to deliver a matching email. */
export const expectEmail = (email: string, subject: string) =>
  expect
    .poll(() => subjectsFor(email), { timeout: 60_000, intervals: [1_000] })
    .toContain(subject);
