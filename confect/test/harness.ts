/// <reference types="vite/client" />
import { Ref } from "@confect/core";
import { register as registerRateLimiter } from "@convex-dev/rate-limiter/test";
import { convexTest } from "convex-test";
import type {
  DefaultFunctionArgs,
  FunctionReference,
  FunctionVisibility,
  UserIdentity,
} from "convex/server";
import type * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import schema from "../../convex/schema";

const modules = import.meta.glob("../../convex/**/*.*s");

type Callable<Kind extends "query" | "mutation"> = (
  ref: FunctionReference<Kind, FunctionVisibility, DefaultFunctionArgs>,
  args: DefaultFunctionArgs,
) => PromiseLike<unknown>;

type Caller = {
  readonly query: Callable<"query">;
  readonly mutation: Callable<"mutation">;
};

/** Encoded args are plain objects; checked at runtime instead of asserted. */
const toConvexArgs = Schema.decodeUnknownSync(
  Schema.Record(Schema.String, Schema.Unknown),
);

/** Confect-typed calls: decoded returns, and declared errors in the error channel. */
const client = (caller: Caller) => ({
  query: <R extends Ref.AnyQuery>(
    ref: R,
    args: Ref.Args<R>,
  ): Effect.Effect<Ref.Returns<R>, Ref.Error<R> | Schema.SchemaError> =>
    Ref.runWithCodec(ref, args, (fn, encoded) => caller.query(fn, toConvexArgs(encoded))),
  mutation: <R extends Ref.AnyMutation>(
    ref: R,
    args: Ref.Args<R>,
  ): Effect.Effect<Ref.Returns<R>, Ref.Error<R> | Schema.SchemaError> =>
    Ref.runWithCodec(ref, args, (fn, encoded) =>
      caller.mutation(fn, toConvexArgs(encoded)),
    ),
});

export type Person = {
  readonly subject: string;
  readonly email: string;
  readonly givenName: string;
  readonly emailVerified?: boolean;
};

const identity = (person: Person): Partial<UserIdentity> => ({
  subject: person.subject,
  issuer: "https://clerk.test",
  tokenIdentifier: `https://clerk.test|${person.subject}`,
  email: person.email,
  emailVerified: person.emailVerified ?? true,
  givenName: person.givenName,
});

/**
 * A fresh in-memory deployment (with the rate limiter component registered)
 * and helpers to act as anonymous or as a Clerk identity.
 */
export const makeTest = () => {
  const t = convexTest(schema, modules);
  registerRateLimiter(t);
  return {
    t,
    anonymous: client(t),
    as: (person: Person) => client(t.withIdentity(identity(person))),
  };
};

export type TestApp = ReturnType<typeof makeTest>;
