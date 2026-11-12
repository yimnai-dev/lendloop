import * as Clock from "effect/Clock";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as HttpServerRequest from "effect/http/HttpServerRequest";
import * as HttpServerResponse from "effect/http/HttpServerResponse";
import {
  MacLive,
  SIGNATURE_HEADER,
  type SignatureError,
  verify,
} from "../../shared/integration/signature";

export class InvalidPayload extends Schema.TaggedError<InvalidPayload>()(
  "InvalidPayload",
  {},
) {}

const pathOf = (url: string) => new URL(url, "http://localhost").pathname;

/**
 * Returns the raw body once its HMAC (N8N_TO_CONVEX_SECRET) checks out over
 * method, path and body. Nothing is parsed before that.
 */
export const verifiedBody = Effect.gen(function* () {
  const request = yield* HttpServerRequest.HttpServerRequest;
  const body = yield* request.text.pipe(Effect.orDie);
  const secret = yield* Config.Redacted("N8N_TO_CONVEX_SECRET").pipe(Effect.orDie);
  const nowSeconds = Math.floor((yield* Clock.currentTimeMillis) / 1000);
  yield* verify(
    secret,
    request.headers[SIGNATURE_HEADER],
    { method: request.method, path: pathOf(request.url), body },
    nowSeconds,
  ).pipe(
    Effect.provide(MacLive),
    // A key-import failure is our bug, not the caller's.
    Effect.catchTag("CryptoError", (error) => Effect.die(error)),
  );
  return body;
});

/** Decodes a verified JSON body against `schema`. */
export const decodeBody = <S extends Schema.Top & { readonly DecodingServices: never }>(
  schema: S,
  body: string,
) =>
  Schema.decodeUnknownEffect(Schema.fromJsonString(schema))(body).pipe(
    Effect.mapError(() => new InvalidPayload()),
  );

export const jsonResponse = (value: unknown) =>
  HttpServerResponse.text(JSON.stringify(value), { contentType: "application/json" });

/**
 * Maps failures to bare status codes. The reason is logged, never echoed, so
 * a caller can't learn why a forged request failed.
 */
export const signedRoute = <R>(
  handler: Effect.Effect<
    HttpServerResponse.HttpServerResponse,
    InvalidPayload | SignatureError,
    R
  >,
) =>
  handler.pipe(
    Effect.catchTags({
      SignatureError: (error) =>
        Effect.as(
          Effect.logWarning("Rejected unsigned automation call", error.reason),
          HttpServerResponse.text("Unauthorized", { status: 401 }),
        ),
      InvalidPayload: () =>
        Effect.succeed(HttpServerResponse.text("Bad request", { status: 400 })),
    }),
  );
