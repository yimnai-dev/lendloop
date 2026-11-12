# Production note

What I'd change or add to run LendLoop for real. The ordering is roughly by risk.

## Deploy topology

| Piece   | Production choice                                                                                                                                                                                                                                            |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Next.js | Vercel (or any Node host). `bunx convex deploy --cmd 'bun run build'` builds against the prod deployment.                                                                                                                                                    |
| Convex  | A separate **production deployment**, with env vars set via `convex env set --prod` or the dashboard. Deploy keys stay in CI secrets only.                                                                                                                   |
| Clerk   | A production instance on our domain, with the `convex` JWT template recreated. The Clerk webhook goes to `https://<prod>.convex.site/webhooks/clerk`.                                                                                                        |
| n8n     | Self-hosted on a small VM or container service behind TLS (or n8n Cloud). It uses **Postgres** instead of SQLite, **queue mode** with a worker if volume grows, and **external task runners** (the internal mode is deprecated and shares the main process). |
| Email   | Resend with a verified sending domain (SPF, DKIM, DMARC). `RESEND_BASE_URL=https://api.resend.com`.                                                                                                                                                          |

There's no tunnel in production: Convex calls n8n's public HTTPS webhook URL.

## Secrets

- Use three independent random values: `CONVEX_TO_N8N_SECRET`, `N8N_TO_CONVEX_SECRET` and `N8N_ENCRYPTION_KEY`. Each is ≥ 32 bytes, stored in a secret manager, and injected as env. Never commit them, and never put them in workflow JSON.
- The Resend API key lives only in the n8n credential store, encrypted with `N8N_ENCRYPTION_KEY`. Scope it to "sending access" for one domain.
- **Rotation without downtime.** Teach the verifiers to accept either of two secrets (`v1` against `SECRET` or `SECRET_NEXT`), roll the signer, then drop the old one. The header format already has room for this.
- **Release checklist.** `bun scripts/n8n-build.ts --check` passes, and a grep for every live secret value over the repo and over `n8n export:workflow --all` output finds nothing.

## Harden the n8n side

- **Env access.** Code nodes read the HMAC secrets from `$env`, which means `N8N_BLOCK_ENV_ACCESS_IN_NODE=false`, and _any_ workflow author can read _any_ env var. In production:
  - Keep the editor limited to admins (SSO, no public sign-up).
  - Keep only these two secrets in the n8n env.
  - Better: move signing and verification into a tiny **custom n8n node or credential type**, with the secret as an encrypted credential, and turn env access back off.
- Restrict `NODE_FUNCTION_ALLOW_BUILTIN` to `crypto` (as now). Allow no external modules.
- Put n8n's editor behind SSO or a VPN. Expose **only** `/webhook/lendloop-notify` publicly via the reverse proxy. Rate-limit that path at the proxy.
- Execution data: keep `EXECUTIONS_DATA_SAVE_ON_SUCCESS=none`, prune failures after 7 days, and don't log request bodies.
- Pin the image version (`N8N_VERSION`) and upgrade deliberately. Workflows are code-generated, so a diff shows what an upgrade changes.

## Reliability

- **Outbox.** It already gives at-least-once delivery with backoff, a dead-letter state and an admin retry. Add alerting on `dead > 0` or on a `pending` row older than 15 minutes. That's a scheduled check that posts to Slack or PagerDuty.
- **Overdue job.** It's idempotent per loan per day, so re-running is safe. Alert if no `reminder_*` or `workflow_error` event has arrived by 10:00 on a day with overdue loans (a dead man's switch).
- **The n8n error workflow** writes to `automationEvents`. Alert on `workflow_error` too.
- **Scale limits to revisit.** Browse and admin lists `take(200)`, and the overdue list is unbounded. Before the neighborhood outgrows them, switch to Convex pagination (`usePaginatedQuery`) and batch the overdue endpoint with a cursor.

## Observability

- **Convex.** Stream logs to a log drain (Axiom or Datadog). Effect spans (`Effect.fn` names) are already in place. Export them via OpenTelemetry when Confect supports it.
- **Next.js.** Add error reporting (Sentry) and web vitals.
- **Audit dashboards.** `trustAudit` for admin actions, and `automationEvents` for automations, both visible in `/admin`.

## Product and abuse

- Tune the rate limits with real data (requests are 10/hour, listings 20/day). Add report-a-listing for neighbors, feeding the admin's remove queue.
- Photos: add server-side image re-encoding to strip EXIF/GPS. The type and size are already checked.
- Moderation: give the admin "remove listing" a reason field that's emailed to the owner via the same outbox.
- Multi-neighborhood: add a `neighborhoodId` on users, tools and loans, enforced in `RequireUser` and every index.

## Testing before launch

- Add a Playwright E2E using Clerk testing tokens:
  - sign in, list a tool, request it as a second user, approve it, and check the inbox via resendev's API;
  - run in CI against a preview Convex deployment with docker-compose services.
- A load test of the browse query, and of approve under concurrent requests. Convex mutations are serializable, but check that the auto-decline fan-out stays inside mutation limits.
