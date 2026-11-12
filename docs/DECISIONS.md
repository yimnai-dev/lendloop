# Decisions, and why

Every choice in one line of "what" and one of "why". The raw build log is in [DESIGN.md](DESIGN.md).

## Stack

| Pick                                         | Why                                                                                                                                                                                                                             |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js 16, App Router, Cache Components** | Pages are static shells served from the edge; only live data streams in. Hooks that read the URL or request sit inside `<Suspense>` so routes still prerender.                                                                  |
| **Convex**                                   | Live queries out of the box: an approval on the lender's screen updates the borrower's without polling or websockets code. Transactions make the outbox trivially correct.                                                      |
| **Confect (Effect 4 on Convex)**             | One Effect Schema defines a table, a function's args and its return. Errors are typed values (`NotFound`, `Forbidden`, `Conflict`) instead of thrown strings, and the React hooks return them as a `Result` the UI must handle. |
| **Effect**                                   | Retries with backoff, services/layers for the n8n notifier, schema decoding and typed errors, all composable and testable without mocks of globals. Used wherever it fits; not forced into React.                               |
| **Effect Schema everywhere**                 | The same schema validates the form (via Standard Schema), the Convex argument and the HTTP body from n8n. One rule, one place. Branded types (`IsoDate`) stop raw strings leaking into date math.                               |
| **Clerk**                                    | Hosted auth with verified emails (needed for the admin bootstrap rule) and testing tokens for Playwright. Convex validates its JWT directly.                                                                                    |
| **n8n**                                      | Required by the brief, and the right split: n8n owns schedules and email delivery, Convex owns data and rules. Code-node JavaScript lives in `n8n/code/` and is unit-tested; the JSON is generated.                             |
| **TanStack Form**                            | Typed fields, Standard Schema validation, no re-render storms, no `useEffect` to sync state.                                                                                                                                    |
| **nuqs**                                     | Filters, tabs and admin status live in the URL: shareable, back-button friendly, and no client state to keep in sync.                                                                                                           |
| **shadcn/ui + Tailwind v4**                  | Owned component source we restyle freely; tokens in one CSS file.                                                                                                                                                               |
| **bun, oxlint (type-aware), oxfmt**          | Fast installs, fast lint with type rules, one formatter. `bun run check` runs everything CI runs.                                                                                                                               |

## Code rules

| Rule                             | Why                                                                                                                                                                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **No `useEffect`**               | Effects that sync state are the usual source of stale UI and double fetches. Everything is derived on render (availability, overdue, labels) or comes from a live query. The one first-visit side effect uses a cached promise and `use()`. |
| **No `any`, no needless casts**  | Strict TS with `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess`; type guards (`isUserKey`) instead of `as`.                                                                                                                      |
| **Derive, don't store**          | "Active", "overdue" and "available" are computed from dates, so they can't go stale. The one exception is below.                                                                                                                            |
| **Small files, feature folders** | `components/<feature>/`, one component per file, pure rules in `shared/domain`.                                                                                                                                                             |

## Backend design

| Decision                                                                                               | Why                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Resource-based auth in Convex** (`RequireUser`, `RequireRole`, `requireOwnTool`, `requireLoanParty`) | The UI only hides; Convex enforces. Strangers get `NotFound`, not `Forbidden`, so ids can't be probed.                                                                                                              |
| **Transactional outbox → n8n**                                                                         | The notification row commits with the state change, so an email can't be lost or sent for a rolled-back change. A dispatcher retries with backoff; dead rows are visible and retryable from /admin.                 |
| **HMAC per direction, Stripe-style header**                                                            | Separate secrets for Convex→n8n and n8n→Convex; the MAC covers method, path, timestamp and body; 5-minute replay window; constant-time compare.                                                                     |
| **Idempotency keys on every write-back and email**                                                     | n8n retries are safe: duplicates return `{duplicate: true}`; Resend dedupes by `Idempotency-Key`.                                                                                                                   |
| **Minimal payloads**                                                                                   | n8n gets only what one email needs. Emails between parties are revealed only while a loan is approved.                                                                                                              |
| **Cursor pagination with "Show more"**                                                                 | Browse, Borrowing, Lending and admin Loans use Convex `paginate()` on an index, newest first. "Show more" keeps your place and works with live updates; numbered pages don't fit cursors and shift under live data. |
| **`ownerTrusted` on tools (the one denormalization)**                                                  | "Trusted lenders only" must filter _in the index_, or a page of 12 could come back with 2 items. Granting/revoking Trusted Lender patches the owner's tools in the same mutation, so it can't drift.                |

## Design

| Decision                                    | Why                                                                                                                                                                 |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Editorial direction**                     | A neighborhood library, not a SaaS dashboard: warm paper `#F7F4EF`, ink `#1B1916`, hairline rules, Instrument Serif for titles, Geist for text.                     |
| **Colour only for status**                  | Moss = available/approved, ochre = waiting/on loan, rust = overdue/failed, shown as a dot and a word. Everything else is ink, so status is the first thing you see. |
| **Calendar range picker**                   | Booked days are struck through and unselectable; the button states the result ("Request Nov 12 – 14 · 3 days"), so there's nothing to misread.                      |
| **Tabs by stage** (Waiting · Out · History) | Each list answers one question; history doesn't bury what needs a decision.                                                                                         |

## Testing

| Layer                                 | Why                                                                                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vitest + convex-test**              | RBAC and loan rules are tested against the real functions as different identities, where they're enforced.                                        |
| **Code-node tests**                   | The real n8n JavaScript runs in a VM and must produce signatures the server accepts.                                                              |
| **Playwright + Clerk testing tokens** | The full loop against the live stack: list → request → approve → return, asserting the three emails arrive via n8n. One browser context per user. |
