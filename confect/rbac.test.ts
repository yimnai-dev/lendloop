import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addDays, todayIn } from "../shared/domain/IsoDate";
import refs from "./_generated/refs";
import { makeTest, type Person, type TestApp } from "./test/harness";

const api = refs.public;

const ada: Person = { subject: "user_ada", email: "ada@example.test", givenName: "Ada" };
const ben: Person = { subject: "user_ben", email: "ben@example.test", givenName: "Ben" };
const cleo: Person = {
  subject: "user_cleo",
  email: "cleo@example.test",
  givenName: "Cleo",
};
const root: Person = {
  subject: "user_root",
  email: "root@example.test",
  givenName: "Root",
};

const today = todayIn("UTC", Date.now());
const dates = (from: number, to: number) => ({
  startDate: addDays(today, from),
  endDate: addDays(today, to),
});

/** The tagged error an effect failed with, or "ok". */
const outcome = async <A, E extends { readonly _tag: string }>(
  effect: Effect.Effect<A, E>,
) => {
  const exit = await Effect.runPromiseExit(effect);
  if (Exit.isSuccess(exit)) return "ok";
  const error = exit.cause.reasons.find((reason) => reason._tag === "Fail");
  return error === undefined ? "defect" : error.error._tag;
};

const run = <A, E>(effect: Effect.Effect<A, E>) => Effect.runPromise(effect);

let app: TestApp;

const provision = (...people: ReadonlyArray<Person>) =>
  Promise.all(
    people.map((person) => run(app.as(person).mutation(api.users.provision, {}))),
  );

const listDrill = (owner: Person) =>
  run(
    app.as(owner).mutation(api.tools.create, {
      name: "Cordless drill",
      category: "power_tools",
      condition: "good",
      description: "18V",
      photoIds: [],
    }),
  );

beforeEach(async () => {
  vi.stubEnv("ADMIN_EMAILS", root.email);
  vi.stubEnv("APP_TZ", "UTC");
  app = makeTest();
  await provision(ada, ben, cleo, root);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("authentication", () => {
  it("anonymous visitors see only names and categories", async () => {
    await listDrill(ada);
    expect(await run(app.anonymous.query(api.catalog.publicList, {}))).toEqual([
      { name: "Cordless drill", category: "power_tools" },
    ]);
    expect(
      await outcome(app.anonymous.query(api.tools.browse, { trustedOnly: false })),
    ).toBe("NotSignedIn");
  });

  it("a signed-in Clerk user without a LendLoop record is not provisioned", async () => {
    const stranger = { subject: "user_new", email: "new@example.test", givenName: "New" };
    expect(await outcome(app.as(stranger).query(api.loans.myRequests, {}))).toBe(
      "AccountNotProvisioned",
    );
  });

  it("grants admin only for a verified allowlisted email", async () => {
    const unverified = { ...root, subject: "user_root_2", emailVerified: false };
    await provision(unverified);
    expect(await outcome(app.as(unverified).query(api.admin.users, {}))).toBe(
      "AdminOnly",
    );
    expect(await outcome(app.as(root).query(api.admin.users, {}))).toBe("ok");
  });
});

describe("listings are owner-only", () => {
  it("only the owner can edit or remove a listing", async () => {
    const toolId = await listDrill(ada);
    const edit = {
      toolId,
      name: "Mine now",
      category: "power_tools",
      condition: "good",
      description: "",
      photoIds: [],
    } as const;
    expect(await outcome(app.as(ben).mutation(api.tools.update, edit))).toBe("Forbidden");
    expect(await outcome(app.as(ben).mutation(api.tools.archive, { toolId }))).toBe(
      "Forbidden",
    );
    expect(await outcome(app.as(ada).mutation(api.tools.update, edit))).toBe("ok");
  });
});

describe("loan workflow", () => {
  it("owners can't borrow their own tools", async () => {
    const toolId = await listDrill(ada);
    expect(
      await outcome(
        app.as(ada).mutation(api.loans.request, { toolId, dates: dates(1, 2) }),
      ),
    ).toBe("Forbidden");
  });

  it("only the lender decides, and strangers can't see the loan", async () => {
    const toolId = await listDrill(ada);
    const loanId = await run(
      app.as(ben).mutation(api.loans.request, { toolId, dates: dates(1, 3) }),
    );
    expect(await outcome(app.as(ben).mutation(api.loans.approve, { loanId }))).toBe(
      "Forbidden",
    );
    expect(await outcome(app.as(cleo).mutation(api.loans.approve, { loanId }))).toBe(
      "NotFound",
    );
    expect(await outcome(app.as(cleo).mutation(api.loans.cancel, { loanId }))).toBe(
      "NotFound",
    );
    expect(await outcome(app.as(ada).mutation(api.loans.approve, { loanId }))).toBe("ok");
  });

  it("reveals the counterpart's email only once approved", async () => {
    const toolId = await listDrill(ada);
    const loanId = await run(
      app.as(ben).mutation(api.loans.request, { toolId, dates: dates(1, 3) }),
    );
    const [pending] = await run(app.as(ada).query(api.loans.incoming, {}));
    expect(pending?.counterpart.email).toBeNull();

    await run(app.as(ada).mutation(api.loans.approve, { loanId }));
    const [approved] = await run(app.as(ada).query(api.loans.incoming, {}));
    expect(approved?.counterpart.email).toBe(ben.email);
  });

  it("approving declines overlapping requests and blocks new overlaps", async () => {
    const toolId = await listDrill(ada);
    const first = await run(
      app.as(ben).mutation(api.loans.request, { toolId, dates: dates(1, 3) }),
    );
    await run(app.as(cleo).mutation(api.loans.request, { toolId, dates: dates(2, 4) }));
    await run(app.as(ada).mutation(api.loans.approve, { loanId: first }));

    const [cleos] = await run(app.as(cleo).query(api.loans.myRequests, {}));
    expect(cleos?.status).toBe("declined");
    expect(
      await outcome(
        app.as(cleo).mutation(api.loans.request, { toolId, dates: dates(3, 5) }),
      ),
    ).toBe("DateConflict");
  });

  it("rejects past starts and over-long loans server-side", async () => {
    const toolId = await listDrill(ada);
    const request = (range: ReturnType<typeof dates>) =>
      outcome(app.as(ben).mutation(api.loans.request, { toolId, dates: range }));
    expect(await request(dates(-1, 1))).toBe("InvalidRequest");
    expect(await request(dates(1, 20))).toBe("InvalidRequest");
  });

  it("writes a notification to the outbox in the same transaction", async () => {
    const toolId = await listDrill(ada);
    await run(app.as(ben).mutation(api.loans.request, { toolId, dates: dates(1, 2) }));
    const events = await app.t.run((ctx) => ctx.db.query("outboxEvents").collect());
    expect(
      events.map((event) => [event.payload.type, event.payload.recipient.email]),
    ).toEqual([["request_created", ada.email]]);
  });
});

describe("admin", () => {
  it("non-admins are refused every admin function", async () => {
    const toolId = await listDrill(ada);
    const users = await app.t.run((ctx) => ctx.db.query("users").collect());
    const adaId = users.find((user) => user.email === ada.email)?._id;
    if (adaId === undefined) throw new Error("ada missing");

    const asBen = app.as(ben);
    expect(await outcome(asBen.query(api.admin.loans, {}))).toBe("AdminOnly");
    expect(await outcome(asBen.query(api.admin.listings, {}))).toBe("AdminOnly");
    expect(await outcome(asBen.mutation(api.admin.removeListing, { toolId }))).toBe(
      "AdminOnly",
    );
    expect(
      await outcome(
        asBen.mutation(api.admin.setTrustedLender, { userId: adaId, trusted: true }),
      ),
    ).toBe("AdminOnly");
  });

  it("admins remove any listing and grant Trusted Lender with an audit row", async () => {
    const toolId = await listDrill(ada);
    const asRoot = app.as(root);
    await run(asRoot.mutation(api.admin.removeListing, { toolId }));
    expect(
      await run(app.as(ben).query(api.tools.browse, { trustedOnly: false })),
    ).toEqual([]);

    const adaRow = (await run(asRoot.query(api.admin.users, {}))).find(
      (u) => u.firstName === "Ada",
    );
    if (adaRow === undefined) throw new Error("ada missing");
    await run(
      asRoot.mutation(api.admin.setTrustedLender, { userId: adaRow._id, trusted: true }),
    );

    const after = (await run(asRoot.query(api.admin.users, {}))).find(
      (u) => u._id === adaRow._id,
    );
    expect(after?.trustedLender).toBe(true);
    expect(after?.lastTrustChange).toMatchObject({
      action: "grant",
      actorFirstName: "Root",
    });
  });
});
