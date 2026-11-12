# Healthcare security note

How LendLoop's design would change if it handled health data. One example would be a clinic or community health program lending **medical equipment** (wheelchairs, CPAP machines, glucose monitors) to patients. The question of who borrowed what, and when, then becomes protected health information (PHI). In the US, a borrowed CPAP or a mobility aid linked to a named person reveals a condition. That falls under HIPAA, and there are equivalents elsewhere (GDPR Art. 9 special-category data, PIPEDA, and so on).

## What changes first: the data map

| Data                            | Today                              | With PHI                                                                                                                                             |
| ------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tool catalog (name, category)   | Public                             | Still fine **if** generic. Categories like "Respiratory" plus a small neighborhood can identify people, so keep the public page off or aggregate it. |
| Loans (who × what × when)       | Visible to both parties and admins | **PHI.** Minimum-necessary access only; every read is audited.                                                                                       |
| Notification emails             | Tool name + dates + first name     | **PHI in transit to email.** Send content-free notices instead: "You have an update in LendLoop", with a link to the authenticated app.              |
| n8n payloads and execution logs | Recipient email + tool name        | PHI. Strip it: send n8n only `{eventId, type, recipientEmail}` and keep the item out entirely, or don't route PHI through n8n at all (see below).    |
| Photos                          | Stored in Convex                   | Could show identifiable homes or people. Review, strip EXIF, and avoid them where possible.                                                          |

The current design already has the right shape for this. The minimal payload contract is one schema, the email reveal is a single policy, and n8n keeps no successful executions. Each of these tightens further rather than needing a rewrite.

## Vendors: BAAs or architecture changes

Every service that stores or transmits PHI needs a **Business Associate Agreement** (HIPAA) or a DPA with SCCs (GDPR).

- **Convex.** Confirm a BAA and the HIPAA-eligible plan. If none is available, self-host the open-source Convex backend in our own HIPAA-compliant cloud account.
- **Clerk.** It holds identity, not loan data. Get a BAA anyway, because "patient of program X" is itself sensitive. Enforce MFA for staff and admins.
- **n8n.** Self-host it inside the same compliant boundary (VPC, encrypted disk, Postgres with encryption at rest). n8n Cloud isn't a fit without a BAA.
- **Email (Resend).** Without a BAA, email bodies must carry **no PHI**: use the content-free notices above. With a BAA-covered provider, PHI in email still needs patient consent and TLS enforcement.
- **Logging and monitoring vendors** need BAAs too, or must be configured never to receive payloads.

## Controls to add

**Access control and least privilege.**

- Split today's single `admin` role into **program staff** (can see loans for their program), **equipment manager** (inventory, no patient identities) and **auditor** (read-only access to audit logs). `RequireRole` already takes options per function, so this is an enum change plus policies.
- Use break-glass access for "view all loans", with a reason field and an alert.
- Strangers get `NotFound` (already) and never learn that a loan exists.

**Audit logging (HIPAA §164.312(b)).**

- Keep an append-only access log for **reads** of PHI as well as writes: who viewed which loan and when. `trustAudit` is the pattern; generalize it to `accessAudit` written inside each query or mutation.
- Ship it to immutable storage (WORM bucket) and retain it ≥ 6 years.

**Encryption.**

- TLS everywhere: Convex, n8n and email are already TLS endpoints, so require it, with HSTS on the app.
- At rest: provider encryption plus field-level encryption for especially sensitive fields (free-text notes, diagnosis-adjacent descriptions), with keys in a KMS. Search and indexes would then avoid those fields.

**Integrity of the integration.** Keep the existing signed, timestamped, path-bound HMAC in both directions with separate secrets. Add:

- rotation and KMS-held secrets;
- **mTLS** or private networking (VPC peering, private link) between Convex and n8n, so the webhook isn't public at all;
- moving signing into an n8n credential-backed custom node, so Code nodes don't need env access.

**Retention and minimization.**

- Set a retention schedule: for example, anonymize loans N months after return, keeping only aggregate counts.
- n8n: no successful executions (already), failed executions pruned in ≤ 7 days with payload redaction, and no PHI in error messages. The error workflow already sends only `{executionId, workflow, node, message}`, so cap and scrub the message.
- Account deletion: the existing anonymization still holds. HIPAA, though, may _require_ keeping some records. Reconcile the two with legal: delete identity, keep the de-identified record.

**Patient rights and consent.**

- Consent for being contacted, and for which channel (email or SMS).
- Right of access: export a patient's loan history.
- Accounting of disclosures: who was notified of what. The outbox and `automationEvents` already record this. Make it reportable.

**Operational.**

- Run a risk assessment and keep it up to date.
- Write an incident response plan with breach-notification timelines (HIPAA: without unreasonable delay, ≤ 60 days; GDPR: 72 h to the regulator).
- Train staff, and review access quarterly.
- Get a pen test before launch and after major changes. Add dependency scanning and an SBOM in CI.
- Add session controls: short idle timeouts for staff in Clerk, and no PHI in URLs. Today's URLs carry only opaque ids and filters; keep it that way.

## What I'd change in the code first

1. **Notification payload** becomes `{eventId, type, recipient.email}` and the email body becomes generic. That's one schema in `shared/integration/events.ts` plus the n8n email builder.
2. **Overdue reminders**: same treatment. Convex returns only `{reminderKey, recipient.email, daysOverdue}`.
3. **Roles** become `staff | equipment_manager | auditor | patient`, with policies updated and the RBAC tests extended to the matrix.
4. **Access audit**: a helper that every loan-reading function calls, plus a test that fails if a new query skips it. It's enforced through middleware, so it can't be forgotten.
5. **Public catalog** turned off, or reduced to category counts.
