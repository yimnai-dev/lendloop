# LendLoop — Design decisions

Working record of decisions, kept as they were made (some early bullets were refined later, see "Decisions made during build"). The README summarizes the result.

## Stack & tooling

- Next.js (App Router), TypeScript (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- Clerk (auth) · Convex (cloud dev deployment) · n8n (self-hosted, Docker)
- **Effect 4 + Confect v10** wherever it fits: DB schema, function args/returns, HTTP API, services/layers, retries
- **Effect Schema** for all validation (Standard Schema for forms)
- Tailwind v4 + shadcn/ui · TanStack Form · nuqs (URL state)
- bun · oxlint · oxfmt
- Single app layout: `app/`, `convex/`, `shared/` (domain schemas imported by both), `n8n/workflows/`, `docker-compose.yml`

## Code rules

No `any`, no needless casts, generics where they help, small files, no `useEffect`: derive state instead of syncing it.

## Domain

- **Categories** (literal union): power_tools, hand_tools, garden, kitchen, camping, cleaning, outdoor, other
- **Condition** (literal union): new, good, fair, worn
- **Tool**: name, category, condition, description, optional photo (Convex storage, type and size validated on the server), ownerId, archivedAt?
- **Loan lifecycle**: `pending → approved → returned`, plus `declined` (by the lender) and `cancelled` (by the borrower while pending). "Active" and "overdue" are computed from dates, never stored.
- **Dates**: ISO calendar dates (branded schema). Overdue means `endDate < today` in `APP_TZ`, computed with Temporal (polyfill).
- **Overlaps**: the request form shows booked ranges. Approving a request that overlaps an approved loan is rejected. Approving one auto-declines overlapping pending requests and notifies those borrowers.
- **Return**: only the lender can mark a loan returned.
- **Delete tool**: blocked while a loan is out. Otherwise the tool is soft-archived, and its pending requests are auto-cancelled with notifications sent. Editing is always allowed.

## Identity, roles, privacy

- The Convex `users` table is the source of truth for `role` (`admin` | `user`). Emails in `ADMIN_EMAILS` become admin when they're first provisioned.
- Users are synced by a Clerk webhook (svix-verified) to a Convex HTTP action. On `user.deleted`, the user is anonymized. Until the user doc exists, the UI shows "setting up your account" (derived from the query).
- RBAC is enforced in every Convex function through Effect services and helpers (`CurrentUser`, `requireAdmin`, `requireToolOwner`, `requireLoanParty`).
- **Trusted Lender**: badge, sort-first plus a "Trusted only" filter, and an audit trail (who granted or revoked it, and when).
- **Public page**: a dedicated query returns only `{ name, category }`.
- **Signed-in users** see only the owner's first name and trusted badge. Emails are shown only to the two parties once a loan is approved.
- Rate limiting via `@convex-dev/rate-limiter` on borrow requests and listing creation.

## Automation (n8n)

- **Email**: Resend in production. n8n's HTTP Request node calls the Resend REST API with the base URL from env and the key in an n8n credential. Locally, **resendev** (`jupitercl/resendev`) runs in docker-compose.
- **Convex → n8n**: transactional **outbox**. The mutation writes an `outboxEvents` row in the same transaction, then schedules an Effect dispatcher that retries with exponential backoff and jitter (`Schedule`) and marks rows `delivered` or `dead`.
- **Reaching local n8n** from cloud Convex: a tunnel (cloudflared or ngrok).
- **Signing**: Stripe-style `X-LendLoop-Signature: t=<unix>,v1=<hex HMAC-SHA256("t.body")>`, 5-minute tolerance, timing-safe compare, **separate secrets per direction**.
- **n8n verification**: Webhook node (raw body) → Crypto node (HMAC, secret via `$env`) → compare. Requires `N8N_BLOCK_ENV_ACCESS_IN_NODE=false`. No secrets in the exported JSON.
- **Notification payload** (minimal, resolved): `{ eventId, type, recipient: { email, firstName }, tool: { name }, loan: { startDate, endDate, status } }`
- **Overdue workflow**: a daily Schedule → signed `GET /overdue` (Convex decides: overdue and not reminded today) → send to the borrower only → signed write-back with idempotency key `loanId:YYYY-MM-DD` (upsert, so retries are no-ops).
- **Failures**: Retry On Fail on n8n HTTP nodes. A global Error Trigger workflow posts a signed failure report to Convex, which writes it to `automationEvents`. An admin automation dashboard shows outbox status, dead letters and recent runs, with a retry button.
- **Bonus**: an activity timeline per loan from `automationEvents` ("Reminder sent 2 days ago").

## UX / routes

`/` (public) · `/tools?category=` · `/tools/[id]` · `/me/listings` · `/me/requests` · `/me/incoming` · `/admin/{listings,loans,users,automation}`

## Quality

- Unit tests: RBAC rules, state transitions, HMAC (tampered, stale, wrong secret), idempotent write-backs (`@confect/test` / convex-test)
- Playwright E2E happy path (Clerk test mode)
- GitHub Actions: typecheck, oxlint, oxfmt --check, tests
- Seed script with demo tools and an overdue loan

## Decisions made during build

- **Loan limits**: start between today and 60 days ahead; length 1–14 days. Enforced in a shared schema, so the form and the server agree.
- **One pending request per borrower per tool.**
- **Photos**: up to 3 per tool, each ≤ 5 MB, jpeg/png/webp. The type is checked from stored file metadata on the server. Photos are shown only to signed-in users.
- **"Today" in the UI** is derived on the client in `NEXT_PUBLIC_APP_TZ` using `shared/domain/loanView`. Queries return raw dates and never read the clock, so they stay cacheable. Server-side "today" (overdue endpoint) uses `APP_TZ`.
- **Svix v2** `verify()` returns nothing, so the webhook verifies the raw body first and only then parses it.
- **Dev**: `convex dev` doesn't watch `confect/`, so `scripts/watch-confect.ts` forwards edits by touching a generated Convex entry point.
- **Provisioning from the JWT**: on first sign-in the client calls `users.provision`, which creates the user from the verified Convex JWT (`email`, `email_verified`, `given_name` claims from the `convex` template). There's no window where Clerk knows someone the backend doesn't, and local dev works without a public webhook URL. The Clerk webhook still syncs profile changes and deletions, and never revives an anonymized user. Admin bootstrap only matches **verified** emails, on both paths.
- **Auth checks are resource-based**: `proxy.ts` only attaches Clerk's session. Authorization lives in Convex functions, and the signed-in shell redirects visitors without a session on the client. This follows Clerk's deprecation of `createRouteMatcher`, and it keeps every page in the static shell (Cache Components).
- **Transient auth errors render as loading**: `NotSignedIn` and `AccountNotProvisioned` occur briefly while the Convex token or first-visit provisioning settles. `QueryView` shows a skeleton for them instead of an error.
- **Public list groups duplicates** ("Ladder ×2"). Public rows carry no ids, so grouping by name and category also gives stable keys.
- **Clerk for local dev** uses accountless keys (`clerk init --accountless`). The `convex` JWT template is created through the Backend API; see the README.
- **Routes as built**: `/listings`, `/requests`, `/incoming` (no `/me` prefix), and `/admin?tab=loans|users|listings|automation` as one page with URL-driven tabs.
- **n8n workflows are generated** from `scripts/n8n/workflows.ts` + `n8n/code/*.js`, and CI checks the JSON for drift. Signature checks run in Code nodes (`node:crypto`), not the Crypto node, because the MAC covers the raw body and the Code node can read it exactly.
- **Outbox redrive**: dead notifications can be re-queued (`outbox:redrive` internally, or **Retry failed** in /admin). The eventId is the email Idempotency-Key.
