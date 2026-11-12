import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import * as HttpRouter from "effect/http/HttpRouter";
import * as HttpServerRequest from "effect/http/HttpServerRequest";
import * as HttpServerResponse from "effect/http/HttpServerResponse";
import { Webhook } from "svix";
import { Email } from "../../shared/domain/User";
import refs from "../_generated/refs";
import { MutationRunner } from "../_generated/services";

class InvalidWebhook extends Schema.TaggedError<InvalidWebhook>()("InvalidWebhook", {
  reason: Schema.String,
}) {}

const EmailAddress = Schema.Struct({ id: Schema.String, email_address: Email });

/** Only the Clerk fields we keep; everything else in the payload is ignored. */
const ClerkEvent = Schema.Union([
  Schema.Struct({
    type: Schema.Literals(["user.created", "user.updated"]),
    data: Schema.Struct({
      id: Schema.String,
      first_name: Schema.NullOr(Schema.String),
      primary_email_address_id: Schema.NullOr(Schema.String),
      email_addresses: Schema.Array(EmailAddress),
    }),
  }),
  Schema.Struct({
    type: Schema.Literal("user.deleted"),
    data: Schema.Struct({ id: Schema.String }),
  }),
]);

/** Event types we don't handle are acknowledged so Clerk stops retrying them. */
const EventType = Schema.fromJsonString(Schema.Struct({ type: Schema.String }));
const isHandled = (type: string) =>
  type === "user.created" || type === "user.updated" || type === "user.deleted";

const decodeEvent = Schema.decodeUnknownEffect(Schema.fromJsonString(ClerkEvent));

/** Verifies the svix signature over the raw body before parsing anything. */
const verify = Effect.fn("clerkWebhook.verify")(function* (
  body: string,
  headers: Readonly<Record<string, string | undefined>>,
) {
  const secret = yield* Config.Redacted("CLERK_WEBHOOK_SECRET").pipe(Effect.orDie);
  yield* Effect.try({
    try: () =>
      new Webhook(Redacted.value(secret)).verify(body, {
        "svix-id": headers["svix-id"] ?? "",
        "svix-timestamp": headers["svix-timestamp"] ?? "",
        "svix-signature": headers["svix-signature"] ?? "",
      }),
    catch: () => new InvalidWebhook({ reason: "signature" }),
  });
});

const handler = Effect.gen(function* () {
  const request = yield* HttpServerRequest.HttpServerRequest;
  const body = yield* request.text.pipe(Effect.orDie);
  yield* verify(body, request.headers);

  const { type } = yield* Schema.decodeUnknownEffect(EventType)(body).pipe(
    Effect.mapError(() => new InvalidWebhook({ reason: "payload" })),
  );
  if (!isHandled(type)) return HttpServerResponse.empty({ status: 204 });

  const event = yield* decodeEvent(body).pipe(
    Effect.mapError(() => new InvalidWebhook({ reason: "payload" })),
  );
  const { runMutation } = yield* MutationRunner;

  if (event.type === "user.deleted") {
    yield* runMutation(refs.internal.users.anonymize, { clerkId: event.data.id });
    return HttpServerResponse.empty({ status: 204 });
  }

  const { id, first_name, primary_email_address_id, email_addresses } = event.data;
  const primary =
    email_addresses.find((address) => address.id === primary_email_address_id) ??
    email_addresses[0];
  if (primary === undefined) {
    return yield* new InvalidWebhook({ reason: "user has no email address" });
  }

  yield* runMutation(refs.internal.users.upsertFromClerk, {
    clerkId: id,
    email: primary.email_address,
    firstName: first_name ?? "Neighbor",
  });
  return HttpServerResponse.empty({ status: 204 });
}).pipe(
  Effect.catchTag("InvalidWebhook", (error) =>
    Effect.as(
      Effect.logWarning("Rejected Clerk webhook", error.reason),
      HttpServerResponse.text("Invalid webhook", { status: 400 }),
    ),
  ),
);

export const clerkWebhookRoute = HttpRouter.add("POST", "/webhooks/clerk", handler);
