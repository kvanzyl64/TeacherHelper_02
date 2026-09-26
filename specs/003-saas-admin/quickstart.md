# Quickstart: Database-Backed Product and SaaS Admin

This is the target validation runbook for the implementation plan. The current repository does not yet provide all commands or end-to-end DB-backed flows below; do not record them as passing until implemented and run against PostgreSQL.

## Prerequisites

- Supported local PostgreSQL service on loopback, `teacher_helper_dev`, and least-privilege runtime roles.
- A separate `teacher_helper_test` database with the test runtime role; no staging/production URLs.
- `apps/web/.env.local` with `DATABASE_URL` for the application runtime role, plus Auth0 OIDC issuer/client configuration. Keep secrets outside source control.
- Auth0 development and test tenants with separate issuer URLs and a provisioned owner identity. No application password hash or seeded provider password.
- Dependencies installed with `pnpm install`.

Required OIDC configuration names are `OIDC_ISSUER_URL`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET`,
`OIDC_AUDIENCE`, `OIDC_JWKS_URI`, `OIDC_AUTHORIZATION_ENDPOINT`, `OIDC_TOKEN_ENDPOINT`,
`OIDC_REDIRECT_URI`, `OIDC_DEV_TENANT`, and `OIDC_TEST_TENANT`. Never record their values here.

## Phase 1 backup evidence

Before schema reconciliation, operator `Anchen` created a custom-format backup of
`teacher_helper_dev` on 2026-09-26. The artifact is stored at
`backups/teacher_helper_dev-20260926-194532.dump` (local, ignored by Git). Restore with:

```powershell
& 'C:\Program Files\PostgreSQL\18\bin\pg_restore.exe' -h 127.0.0.1 -U postgres -d teacher_helper_dev --clean --if-exists backups/teacher_helper_dev-20260926-194532.dump
```

Do not run the restore command unless the database is intentionally being replaced and the
operator has confirmed the target is local development data.

## Reconcile and migrate the local database

1. Take a local backup before schema changes. Inspect current tables, grants, RLS, and migration ledger; this installation is known to contain a partial migration state.
2. Run `pnpm db:status`. It reports the verified baseline and every pending migration without changing data; its ledger is separate from application/test data and writable only by the migration role.
3. Review the reconciliation report. Do not replay migration 013 or edit an applied migration. Resolve mismatches with a forward-only migration after backup.
4. Run `pnpm db:migrate`. It applies pending migrations in dependency order and stops on the first error.
5. Run the planned `pnpm db:verify` command. It must prove required tables, grants, indexes, RLS policies, and non-owner/non-`BYPASSRLS` application roles are present.
6. Run the planned `pnpm db:seed:dev` command to insert deterministic synthetic centres, staff memberships, students, sessions, invoices, notifications, and SaaS subscription records. Never use production data.

Expected result: migration status is clean, synthetic rows are visible only within their intended tenant, and the SaaS-level subscription rows remain distinct from centre invoices/payments.

### Phase 2 validation evidence

- Fresh `teacher_helper_test` migration install and reconciled `teacher_helper_dev` upgrade both
	applied migrations 001-017 in numeric order; status checks report matching SHA-256 checksums.
- `pnpm test:db` passed 4 files and 7 tests covering migration catalog drift, tenant RLS allow/deny,
	transaction rollback and pooled-context reuse, plus managed identity and DAL authorization cases.
- `pnpm typecheck` passed. Runtime roles were verified as non-superuser, non-owner, and
	non-`BYPASSRLS`; the ledger is owned by `teacher_helper_migrator`.

### Verified development baseline

The 2026-09-26 catalog review found these objects in `teacher_helper_dev`: core tables from
migrations 001-003 and platform-admin tables from 013. Migrations 004-012 were not applied;
`app.audit_events` matches the 002 shape, while 011 contains a conflicting historical definition
and must not be replayed. The ledger was created after the backup and records baseline entries for
`001_centre_access`, `002_audit_events`, `003_tenant_policies`, and
`013_platform_admin_auth`. Migrations 004-012 and 014-017 are now applied through forward-only
reconciliation;
migration 013 was not edited or replayed.

## Configure and verify the SaaS owner

1. Create/invite the designated owner in the managed OIDC provider using its administrative console or protected management API.
2. Run the planned audited `pnpm --filter @teacher-helper/web run provision-platform-owner` command with the OIDC issuer/subject. It creates or activates the platform role mapping only; it does not accept/store a password.
3. Sign in through the provider and open `/admin`. Verify that missing, disabled, or non-owner identities are denied and audited.

Expected result: the master SaaS account is a provider-authenticated identity with an explicit active `platform_owner` mapping; no default credentials exist in the database or repository.

## Validate database-bound page workflows

For every route in [page-data-map.md](contracts/page-data-map.md):

1. Create synthetic records through an authorized workflow or test fixture.
2. Load the route and confirm its server-side repository returns those records after authorization.
3. Change or remove the record and reload; confirm the page reflects the database rather than process memory or bundled fixtures.
4. Attempt a second-centre, wrong-role, expired-link, and missing-record request as applicable; verify generic denial and no cross-tenant data.
5. Verify all state-changing actions persist and create the required audit/notification/export record.

Expected result: every data-bearing screen maps to documented tables and is covered by an integration or E2E assertion. Static landing, generic error, and not-found pages are explicitly exempt.

## Test gates

Run unit/contract checks and real PostgreSQL integration tests separately:

```powershell
pnpm test
pnpm test:db
pnpm test:e2e
pnpm lint
pnpm typecheck
pnpm build
```

`pnpm test:db` must refuse an unset, non-local, staging, or production test URL and must use only `teacher_helper_test`. Its suite must execute the migrations and verify RLS isolation with two synthetic centres. E2E must authenticate using the managed provider's test environment or a test-only signed OIDC fixture, never production credentials.

## Evidence to record

- Migration baseline, ordered migration status, and schema/RLS verification output.
- App connection check through the least-privilege runtime role.
- OIDC owner login and denied-role evidence; no secrets in logs.
- Per-route data mapping and at least one live DB read/write assertion for every data-bearing workflow.
- Cross-tenant denial, role denial, guardian-link expiry/relationship checks, and platform audit evidence.
- Synthetic seed provenance, backup/restore result, and actual `pnpm test:db`, E2E, lint, typecheck, and build outputs.
