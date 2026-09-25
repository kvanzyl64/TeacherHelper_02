# Teacher Helper MVP Quickstart Validation

This guide is the implementation-phase validation contract. It describes the checks that must be
runnable once the application scaffold and environment are created; it does not prescribe
implementation bodies or migration scripts.

## Prerequisites

- Node.js current LTS and the repository package manager installed.
- A local PostgreSQL installation with a live `teacher_helper_dev` database and least-privilege
  development role; no local SQLite database is used as the development source of truth.
- An Oracle Cloud compute server available for deployment. PostgreSQL is installed on that server
  only at deployment time; no Oracle Cloud managed SQL service is required.
- Deployment-only PostgreSQL databases and credentials created on the server: `teacher_helper_staging`
  and `teacher_helper_prod`.
- The local development database contains synthetic data only; production data and credentials are
  prohibited in local development.
- Separate staging credentials for authentication, PostgreSQL, protected storage, and the WhatsApp
  provider.
- A private S3-compatible object-storage service on the Oracle server with encrypted private buckets
  for resources, invoice documents, and exports.
- A disposable staging centre, two test users with different centre memberships, one test tutor,
  two test guardians, and test student records.
- A WhatsApp test number approved by the selected provider.
- Provider callback delivery configured for staging only.

## Intended Commands

```text
pnpm install
pnpm lint
pnpm test
pnpm test:contract
pnpm test:e2e
pnpm build
```

The final command names may be adjusted when the repository scaffold is implemented, but the plan
requires equivalent lint, unit, contract, browser, and build checks.

## Database-First Development and Deployment

1. Install local PostgreSQL and configure the `teacher_helper_dev` database, roles, migrations, and
  synthetic seed data before application setup.
2. Configure the local application `.env.local` to use only `teacher_helper_dev`; verify the
  development role cannot access any deployment credentials.
3. At deployment, provision the Oracle Cloud compute host and restrict inbound traffic to HTTPS,
  SSH from an administration path, and required provider callbacks.
4. Install PostgreSQL on the Oracle Cloud server, configure private listening, authentication rules,
  encrypted connections, backups, monitoring, and separate roles for administration, migrations,
  application runtime, and read-only operations.
5. Create `teacher_helper_staging` and `teacher_helper_prod` on the server, apply migrations to
  staging first, deploy the app, and run smoke/integration testing from the server.
6. Promote to production only through the approved release process after the server-side tests pass.

**Expected**: The application starts against the live local PostgreSQL development database. At
deployment, PostgreSQL and the application run on the Oracle Cloud server, server-side smoke and
integration tests pass, database roles are least-privilege, and production is isolated.

## Storage and Backup Validation

1. Upload a session resource, generated invoice document, and tenant export through the application.
2. Confirm objects are private, encrypted, inaccessible by guessed URLs, and retrievable only through
  an authorized signed temporary access path.
3. Run the configured daily backup and verify the backup includes PostgreSQL and protected object
  storage metadata and objects.
4. Restore a disposable copy and verify that tenant scope and object authorization remain intact.

**Expected**: Protected objects cannot be accessed without authorization, daily backup completion is
observable, and a restore preserves both relational records and protected files.

## Scenario 1: Tenant Isolation

1. Create Centre A and Centre B.
2. Create a student, session, invoice, file, and audit event in each centre.
3. Authenticate an administrator from Centre A.
4. Attempt to access Centre B records through normal pages, direct identifiers, file references,
   exports, and background-job inputs.
5. Confirm every attempt is denied without revealing record existence and produces the expected audit
   signal.

**Expected**: No cross-centre record or file is visible or mutable; authorization tests pass at both
application and database-policy boundaries.

Implementation evidence (2026-09-25):

- Added onboarding contract coverage in `tests/contract/onboarding.contract.test.ts` for valid
  creation, duplicate active-name rejection, and trial/subscription selection.
- Added invitation and scope integration coverage in `tests/integration/onboarding-access.test.ts`
  for acceptance, expiry, revocation, and denied Centre B access.
- Added browser coverage in `tests/e2e/onboarding.spec.ts` for onboarding and invite acceptance on
  the desktop/mobile Playwright projects.

## Scenario 2: Guardian Verification and Link Scope

Implementation evidence (2026-09-25):

- Added centre-scoped student, guardian, relationship, consent, verification-challenge, and tutor-assignment migrations with row-level policies.
- Added contract coverage for required people fields, centre-scoped uniqueness, relationship status, and consent decisions.
- Added verification coverage for successful confirmation, expiry, bounded attempts, single use, and revocation.
- Added centre, tutor, and mobile guardian verification routes with shared accessible form components and WhatsApp template construction.

Validation evidence: `npx tsc --build --pretty false` and `npx vitest run` passed; the phase 4 Playwright run is recorded with the implementation validation results.

1. Create a guardian-to-student relationship and have centre staff confirm it.
2. Request a one-time WhatsApp code and complete confirmation for the guardian number.
3. Approve one session and issue one invoice.
4. Open each delivered WhatsApp link on a narrow phone viewport.
5. Confirm each page shows only its linked record and permitted fields without a login.
6. Attempt to alter the token, use it for another record, forward it to an unauthorized test user,
   open it after seven days, and open it after revocation.

**Expected**: Valid links render without horizontal scrolling; invalid, expired, revoked, altered,
or out-of-scope links return a generic unavailable response and create appropriate audit events.

## Scenario 3: WhatsApp Delivery Failure

1. Submit an approved session update with an eligible guardian.
2. Simulate a transient provider failure and confirm bounded retry behavior.
3. Simulate a permanent failure and confirm the centre dashboard shows an actionable follow-up.
4. Confirm the system does not send an automatic SMS or email fallback.
5. Resend a fresh link and verify the prior link is handled according to revocation policy.

**Expected**: Notification state, retry count, provider event identifiers, failure reason, and
centre-visible follow-up are consistent and idempotent.

## Scenario 4: Invoice and Manual Payment

1. Generate a term invoice in ZAR with line items and configured tax treatment.
2. Issue it and open the guardian invoice link on a phone.
3. Record EFT and cash payments as an authorised centre user.
4. Verify unpaid, partially paid, paid, disputed, failed, and cancelled transitions with audit events.
5. Attempt to view another family’s invoice as the guardian.

**Expected**: Totals and receipts are correct, only the linked invoice is visible, and all changes are
attributed to an authorised actor.

## Scenario 5: Retention, Export, and Recovery

1. Request a tenant export and verify scope, expiry, download, and deletion audit events.
2. Seed records in student/session, billing, and audit retention classes.
3. Run the policy evaluation in a staging copy and confirm each class uses its centrally defined rule.
4. Simulate a failed backup or recovery operation.

**Expected**: Child data is not retained beyond its policy, billing and audit evidence follow their
own policy, exports contain only the requesting centre's permitted data, and failed recovery produces
an administrator alert with a last-known-success marker.

## Acceptance Mapping

- Tenant isolation and role scope: [data-model.md](data-model.md), [guardian-link.md](contracts/guardian-link.md)
- WhatsApp verification, retry, and delivery: [whatsapp-delivery.md](contracts/whatsapp-delivery.md)
- Invoice and payment behavior: [invoice-notification.md](contracts/invoice-notification.md)
- Data fields and transitions: [data-model.md](data-model.md)
- Product outcomes: [spec.md](spec.md#success-criteria-mandatory)
