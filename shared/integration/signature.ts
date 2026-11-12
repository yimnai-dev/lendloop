import * as Mac from "effect/crypto/Mac";
import * as SecureRandom from "effect/crypto/SecureRandom";
import * as Effect from "effect/Effect";
import * as Hex from "effect/encoding/Hex";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Result from "effect/Result";
import * as Schema from "effect/Schema";

/**
 * Stripe-style request signing shared by both directions (Convex → n8n and
 * n8n → Convex), each with its own secret:
 *
 *   X-LendLoop-Signature: t=<unix seconds>,v1=<hex HMAC-SHA256>
 *
 * The MAC covers `t.METHOD.path.body`, so a signature can't be replayed with a
 * different body, method or path, and `t` bounds how long it stays valid.
 */
export const SIGNATURE_HEADER = "x-lendloop-signature";
export const TOLERANCE_SECONDS = 5 * 60;

export type SignedRequest = {
  readonly method: string;
  readonly path: string;
  readonly body: string;
};

export class SignatureError extends Schema.TaggedError<SignatureError>()(
  "SignatureError",
  {
    reason: Schema.Literals(["missing", "malformed", "stale", "mismatch"]),
  },
) {}

/** WebCrypto-backed `Mac`; works in Convex, Node, Bun and the browser. */
export const MacLive = Mac.layerWebCrypto.pipe(
  Layer.provide(SecureRandom.layerWebCrypto),
);

const encoder = new TextEncoder();

const canonical = (timestamp: number, request: SignedRequest) =>
  encoder.encode(
    `${timestamp}.${request.method.toUpperCase()}.${request.path}.${request.body}`,
  );

const keyFor = (secret: Redacted.Redacted) =>
  Mac.key(Mac.hmacSha256, encoder.encode(Redacted.value(secret)));

/** Produces the header value for `request`, signed at `nowSeconds`. */
export const sign = Effect.fn("Signature.sign")(function* (
  secret: Redacted.Redacted,
  request: SignedRequest,
  nowSeconds: number,
) {
  const mac = yield* Mac.Mac;
  const key = yield* keyFor(secret);
  const tag = yield* mac.sign(key, canonical(nowSeconds, request));
  return `t=${nowSeconds},v1=${Hex.encode(tag)}`;
});

const HEADER_PATTERN = /^t=(\d{1,12}),v1=([0-9a-f]{64})$/;

const parseHeader = (header: string | undefined) => {
  if (header === undefined || header === "") {
    return Result.fail(new SignatureError({ reason: "missing" }));
  }
  const match = HEADER_PATTERN.exec(header.trim());
  const [, rawTimestamp, rawTag] = match ?? [];
  if (rawTimestamp === undefined || rawTag === undefined) {
    return Result.fail(new SignatureError({ reason: "malformed" }));
  }
  return Result.map(
    Result.mapError(
      Hex.decode(rawTag),
      () => new SignatureError({ reason: "malformed" }),
    ),
    (tag) => ({ timestamp: Number(rawTimestamp), tag }),
  );
};

/**
 * Checks the header against `request`. Fails with a reason, which callers
 * should log but never echo back to the sender.
 */
export const verify = Effect.fn("Signature.verify")(function* (
  secret: Redacted.Redacted,
  header: string | undefined,
  request: SignedRequest,
  nowSeconds: number,
) {
  const { timestamp, tag } = yield* Effect.fromResult(parseHeader(header));
  if (Math.abs(nowSeconds - timestamp) > TOLERANCE_SECONDS) {
    return yield* new SignatureError({ reason: "stale" });
  }
  const mac = yield* Mac.Mac;
  const key = yield* keyFor(secret);
  // Constant-time comparison happens inside `Mac.verify`.
  const valid = yield* mac.verify(key, tag, canonical(timestamp, request));
  if (!valid) return yield* new SignatureError({ reason: "mismatch" });
});
