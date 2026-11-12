import * as Schema from "effect/Schema";

export const Role = Schema.Literals(["admin", "user"]);
export type Role = typeof Role.Type;

export const Email = Schema.String.check(
  Schema.isPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
    message: "Expected an email address",
  }),
).pipe(Schema.brand("Email"));
export type Email = typeof Email.Type;

/** What other signed-in users may see about someone (data minimization). */
export const PublicProfile = Schema.Struct({
  firstName: Schema.String,
  trustedLender: Schema.Boolean,
});
export type PublicProfile = typeof PublicProfile.Type;
