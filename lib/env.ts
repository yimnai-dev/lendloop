import * as Schema from "effect/Schema";

/**
 * Public, build-time env. Next inlines `process.env.NEXT_PUBLIC_*` only when
 * accessed literally, so each one is read by name before validation.
 */
const PublicEnv = Schema.Struct({
  convexUrl: Schema.String.check(Schema.isPattern(/^https?:\/\//)),
  appTimeZone: Schema.String,
});

export const publicEnv = Schema.decodeUnknownSync(PublicEnv)({
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
  appTimeZone: process.env.NEXT_PUBLIC_APP_TZ ?? "UTC",
});
