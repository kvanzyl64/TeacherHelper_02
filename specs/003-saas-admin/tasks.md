---
description: "Executable implementation tasks for the Teacher Helper SaaS admin feature"
---

# Tasks: Database-Backed Product and SaaS Admin

**Input**: Design documents from `/specs/003-saas-admin/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, and `contracts/`

**Tests**: Required by FR-020 and the project constitution. Pure domain behavior may remain unit-tested; persistence, migrations, identity, RLS, repositories, and data-bearing workflows require PostgreSQL integration or authenticated E2E tests.

**Organization**: Shared migration/auth/DAL foundations block all stories. User stories are ordered by the spec's priorities; US4 supplies the first persistent centre workflow, then platform portfolio, SaaS billing, and operations.

## Phase 1: Setup (Database and Provider Readiness)

**Purpose**: Establish safe, inspectable local and test environments without destroying existing data.

- [X] T001 [P] Select and record the managed OIDC provider, issuer, development tenant, and test strategy in `specs/003-saas-admin/research.md` and `specs/003-saas-admin/quickstart.md`; document required secret names without recording values.
- [X] T002 Back up `teacher_helper_dev` and record the backup location, timestamp, restore command, and operator in `specs/003-saas-admin/quickstart.md` before any schema reconciliation.
- [X] T003 [P] Add a read-only PostgreSQL schema/grant/RLS inventory command in `packages/database/scripts/inspect-schema.mjs` and document its expected output in `packages/database/README.md`.
- [X] T004 [P] Add a database URL safety validator for local development and isolated test databases in `packages/test-support/src/database-url.ts`; reject staging/production and reject reset operations against `teacher_helper_dev`.
- [X] T005 Create `teacher_helper_test`, its non-owner test role, and connection instructions in `infra/postgres/local/003_test_database.sql` and `infra/postgres/local/README.md`; do not grant the test or web role `BYPASSRLS`.

## Phase 2: Foundational (Migration, Managed Identity, and DAL)

**Purpose**: Complete these blocking prerequisites before any story binds a page to database data.

- [X] T006 Add a protected migration ledger outside resettable `app` data and a read-only status command in `packages/database/migrations/014_migration_ledger.sql` and `packages/database/scripts/status.mjs`; the ledger must be writable only by the migration role.
- [X] T007 Reconcile existing `teacher_helper_dev` objects against migrations 001-013, record a verified baseline in the migration ledger, and document every mismatch in `specs/003-saas-admin/quickstart.md`; do not edit or replay an already-applied migration.
- [X] T008 Add a migration runner that applies only pending numbered migrations in dependency order and stops on first error in `packages/database/scripts/migrate.mjs`; verify it against a fresh `teacher_helper_test` database.
- [X] T009 Add a forward-only expand migration for `app.auth_identities`, OIDC issuer/subject uniqueness, profile mappings, SaaS subscription/payment tables, and `app.platform_audit_events` in `packages/database/migrations/015_managed_identity_and_saas_billing.sql`; quote model constraints from `specs/003-saas-admin/data-model.md` in migration tests.
- [X] T010 Add forward-only RLS/grant/index corrections for every existing table with `centre_id`, including invoices, payments, exports, retention jobs, notifications, access links, and audit events, in `packages/database/migrations/016_tenant_rls_reconciliation.sql`.
- [X] T011 Add migration and catalog drift tests in `packages/database/src/migration-status.test.ts` and `tests/integration/database-migrations.test.ts`; prove fresh install and verified-baseline upgrade produce the same required schema.
- [X] T012 Implement the managed OIDC verifier/adapter and issuer-subject resolver in `apps/web/lib/auth/oidc-provider.ts` and `apps/web/lib/auth/identity.ts`; reject unknown issuer, invalid signature/audience, disabled identity, and missing role mappings.
- [X] T013 Replace custom password login/session handling in `apps/web/app/auth/login/actions.ts`, `apps/web/app/auth/login/page.tsx`, `apps/web/lib/auth/platform-admin-session.ts`, and `apps/web/lib/auth/platform-admin-credentials.ts` with managed OIDC sign-in/sign-out; retain migration 013 unchanged and disable its password path before any later contract cleanup.
- [X] T014 Implement a server-only request DAL in `apps/web/lib/auth/dal.ts` for authenticated identity, active centre membership, tutor assignment, platform-owner permission, and generic denial behavior; do not accept hardcoded roles or request-supplied centre IDs as authority.
- [X] T015 Implement a transaction-scoped tenant query helper in `apps/web/lib/database/tenant-transaction.ts` using one checked-out `pg` client, `BEGIN`, transaction-local `set_config` for `app.centre_id` and `app.user_id`, `COMMIT`/`ROLLBACK`, and `release` in `finally`.
- [X] T016 Implement separate tenant and platform-admin repository interfaces in `packages/integrations/src/database/tenant-repository.ts` and `packages/integrations/src/database/platform-admin-repository.ts`; expose allowlisted DTOs only and prohibit route-level SQL.
- [X] T017 Add a platform-owner bootstrap command in `apps/web/scripts/provision-platform-owner.mjs` that links an existing managed OIDC issuer/subject to an active `platform_owner` and writes an audit event; reject password arguments and duplicate owner bootstrap without explicit confirmation.
- [X] T018 Add protected migration-role and runtime-role setup in `infra/postgres/local/004_runtime_roles.sql` and `infra/postgres/local/README.md`; assert `teacher_helper_app` is not a table owner, superuser, or `BYPASSRLS` role.
- [X] T019 Add isolated PostgreSQL test lifecycle helpers, a `pnpm test:db` script, and safe synthetic fixtures in `packages/test-support/src/postgres-test-database.ts`, `packages/test-support/src/synthetic-seed.ts`, and `package.json`; test cleanup must refuse every database except `teacher_helper_test`.
- [X] T020 Add RLS and pooled-context integration tests in `tests/integration/tenant-rls.test.ts` for same-centre allow, cross-centre denial, wrong-role denial, transaction rollback, and proving a reused pool connection does not retain prior tenant context.
- [X] T021 Add managed identity/DAL integration tests in `tests/integration/identity-authorization.test.ts` for valid, invalid, disabled, unassigned, platform-owner, and centre-membership identities.

**Checkpoint**: A fresh test DB migrates cleanly; the existing dev DB has a reviewed baseline; the application role is least-privileged; managed identity and DAL/RLS tests pass.

## Phase 3: User Story 4 - Use persistent data across product screens (Priority: P1)

**Goal**: Every data-bearing product workflow reads and writes PostgreSQL under authenticated identity and tenant/relationship scope.

**Independent Test**: Using `teacher_helper_test`, create a centre and synthetic records through authorized workflows, make fresh requests to each route, and verify persisted values. Verify a second tenant, wrong role, tutor without assignment, and invalid guardian link cannot access those values.

### Tests for User Story 4

- [ ] T022 [P] [US4] Add centre onboarding persistence and atomic rollback tests in `tests/integration/onboarding-postgres.test.ts` for centre, owner membership, trial subscription, and audit rows.
- [ ] T023 [P] [US4] Add people, consent, guardian relationship, and tutor assignment RLS tests in `tests/integration/people-postgres.test.ts`.
- [ ] T024 [P] [US4] Add session, resource, invoice, payment, notification, and guardian-link persistence/scope tests in `tests/integration/centre-workflows-postgres.test.ts`.
- [ ] T025 [P] [US4] Add authenticated E2E coverage in `tests/e2e/database-backed-centre.spec.ts` proving a created centre/student survives navigation and reload and another centre cannot see it.

### Implementation for User Story 4

- [ ] T026 [US4] Implement transactional centre creation and owner membership persistence in `packages/integrations/src/centres/postgres-onboarding-repository.ts` and `apps/web/app/(centre)/onboarding/actions.ts`; remove `createInMemoryOnboardingRepository` and `owner-demo`.
- [ ] T027 [US4] Implement current-centre settings reads/writes and audit persistence in `packages/integrations/src/centres/postgres-settings-repository.ts` and `apps/web/app/(centre)/settings/centre/actions.ts`; remove `createInMemoryCentreSettingsRepository` and `centre-demo`.
- [ ] T028 [US4] Bind `/dashboard` metrics and recent activity to centre-scoped repository DTOs in `packages/integrations/src/centres/dashboard.ts` and `apps/web/app/(centre)/dashboard/page.tsx`; distinguish a true zero from DB unavailable.
- [ ] T029 [US4] Bind people/student list and creation pages to `students`, `guardians`, `guardian_students`, `consent_records`, and `tutor_assignments` through repositories in `packages/integrations/src/people/` and `apps/web/app/(centre)/people/`.
- [ ] T030 [US4] Bind guardian directory and staff verification pages to scoped guardian/consent/challenge repositories in `packages/integrations/src/guardians/` and `apps/web/app/(centre)/people/guardians/page.tsx` and `apps/web/app/(centre)/people/verification/page.tsx`.
- [ ] T031 [US4] Bind `/team/invite` and `/auth/invite/[token]` to persisted invite/user/membership repositories in `packages/integrations/src/auth/membership-invitations.ts` and `apps/web/app/(centre)/team/invite/actions.ts`; hash tokens and enforce expiry/status/centre scope.
- [ ] T032 [US4] Bind centre and tutor session lists, approvals, student assignments, and resource access to repositories in `packages/integrations/src/sessions/` and `apps/web/app/(centre)/centre/sessions/` and `apps/web/app/(tutor)/sessions/`; remove `sampleSessions`.
- [ ] T033 [US4] Bind public guardian verification and single-record link pages to challenge/access-link repositories in `packages/integrations/src/guardian-links/` and `apps/web/app/(guardian)/verify/[challenge]/` and `apps/web/app/(guardian)/link/[token]/`; validate token digest, relationship, consent, status, attempts, and expiry before fetching protected records.
- [ ] T034 [US4] Bind centre invoices, payments, and receipts to tenant-scoped repositories in `packages/integrations/src/billing/` and `apps/web/app/(centre)/billing/`; keep family tuition records separate from SaaS subscription billing.
- [ ] T035 [US4] Bind exports and operations pages to export, retention, alert, and audit repositories in `packages/integrations/src/oversight/` and `apps/web/app/(centre)/exports/` and `apps/web/app/(centre)/operations/alerts/`; require owner permission and safe states.
- [ ] T036 [US4] Add real DB health/readiness checks and actionable unavailable states in `apps/web/app/api/health/route.ts`, `apps/web/lib/database.ts`, and `apps/web/app/(centre)/error.tsx`; do not silently fall back to fixtures when `DATABASE_URL` or PostgreSQL is unavailable.
- [ ] T037 [US4] Complete the route-to-table mapping in `specs/003-saas-admin/contracts/page-data-map.md` against all actual App Router routes and verify every row has a repository and test path.

**Checkpoint**: The centre onboarding-to-workspace flow persists and re-reads synthetic records; every data-bearing centre/tutor/guardian route has repository and authorization coverage.

## Phase 4: User Story 1 - Monitor SaaS health and customer portfolio (Priority: P1)

**Goal**: The explicitly provisioned platform owner sees cross-centre business-safe health summaries and audited centre drill-downs from PostgreSQL.

**Independent Test**: Seed multiple synthetic centres in different states, authenticate as the platform owner, and verify portfolio counts, recent changes, safe alert context, centre drill-down, and denial/audit behavior without child or family records.

### Tests for User Story 1

- [ ] T038 [P] [US1] Add platform-owner repository integration tests in `tests/integration/platform-portfolio-postgres.test.ts` for centre-state aggregates, alert counts, date windows, DTO field allowlists, and owner-only access.
- [ ] T039 [P] [US1] Add authenticated portfolio and centre-detail E2E coverage in `tests/e2e/platform-portfolio-live.spec.ts` using synthetic DB seed data and verifying zero/empty and DB-failure states.

### Implementation for User Story 1

- [ ] T040 [US1] Implement cross-centre business-safe portfolio and alert queries in `packages/integrations/src/admin/postgres-dashboard.ts`; query approved views/columns only and use bounded/paginated results.
- [ ] T041 [US1] Replace demo arrays and hardcoded summary copy in `apps/web/features/admin/dashboard.ts` and `apps/web/app/(admin)/admin/page.tsx` with DAL-authorized PostgreSQL DTOs.
- [ ] T042 [US1] Bind `/centres/[centreId]` to the platform-admin repository in `apps/web/app/(admin)/centres/[centreId]/page.tsx`; validate UUID/existence, emit platform access audit, and never query child/session records.
- [ ] T043 [US1] Add database-failure, loading, empty, denied, and stale-data states for platform portfolio pages in `apps/web/app/(admin)/admin/page.tsx` and `apps/web/components/admin/`.

## Phase 5: User Story 2 - Track SaaS subscription health and revenue (Priority: P1)

**Goal**: The platform owner reviews SaaS subscriptions and subscription payments without confusing them with family tuition invoices.

**Independent Test**: Seed active, trial, past-due, failed, and cancelled SaaS subscription/payment events; verify status totals and follow-up rows against direct database assertions, while proving family invoice/payment rows do not affect SaaS revenue totals.

### Tests for User Story 2

- [ ] T044 [P] [US2] Add SaaS subscription/payment aggregate tests in `tests/integration/saas-billing-postgres.test.ts` for ZAR amounts, status transitions, duplicate events, and separation from `app.invoices`/`app.payments`.
- [ ] T045 [P] [US2] Add owner-only live billing E2E coverage in `tests/e2e/admin-billing-live.spec.ts` for plan/status summaries, overdue follow-up, zero state, and denied non-owner access.

### Implementation for User Story 2

- [ ] T046 [US2] Implement SaaS subscription and payment repository queries in `packages/integrations/src/admin/postgres-billing.ts` using the SaaS-specific tables from migration 015 and safe aggregate DTOs.
- [ ] T047 [US2] Replace `demoAdminBillingRows` in `apps/web/features/admin/billing.ts` and bind `apps/web/app/(admin)/admin/billing/page.tsx` to the platform-admin DAL.
- [ ] T048 [US2] Update billing summary and row components in `apps/web/components/admin/billing-overview.tsx` to distinguish subscription revenue from centre tuition billing and render loading/empty/failure states.
- [ ] T049 [US2] Add audited SaaS payment-status/follow-up actions in `apps/web/app/(admin)/admin/billing/actions.ts` and `packages/integrations/src/admin/postgres-billing.ts`; re-check platform-owner permission within each Server Action.

## Phase 6: User Story 3 - Resolve operational escalations and protect tenant boundaries (Priority: P2)

**Goal**: The platform owner can review and resolve safe operational alerts and support cases; all other roles are denied.

**Independent Test**: Seed synthetic export, retention, backup, billing, and support alerts. Verify severity, age/timestamps, safe context, resolution audit, and denials for centre users or unassigned identities.

### Tests for User Story 3

- [ ] T050 [P] [US3] Add platform-alert RLS/capability and append-only audit integration tests in `tests/integration/platform-alerts-postgres.test.ts` for owner access, denied roles, and no child-data fields.
- [ ] T051 [P] [US3] Add owner-only alert queue and resolution E2E tests in `tests/e2e/admin-alerts-live.spec.ts` for severity, timestamps, open age, recovery guidance, and durable audit history.

### Implementation for User Story 3

- [ ] T052 [US3] Implement business-safe platform alert/support-case repository queries and lifecycle writes in `packages/integrations/src/admin/postgres-alerts.ts` and `packages/integrations/src/admin/postgres-support-cases.ts`.
- [ ] T053 [US3] Replace demo alert/support arrays in `apps/web/features/admin/alerts.ts` and bind `apps/web/app/(admin)/admin/alerts/page.tsx` to platform-owner DTOs.
- [ ] T054 [US3] Implement audited acknowledge/resolve actions in `apps/web/app/(admin)/admin/alerts/actions.ts` and `packages/integrations/src/admin/postgres-alerts.ts`; enforce idempotency, role checks, and alert state transitions.
- [ ] T055 [US3] Verify generic denied/not-found states and access-denial audit events in `apps/web/app/(admin)/forbidden/page.tsx`, `apps/web/app/(admin)/centres/[centreId]/page.tsx`, and `tests/integration/platform-alerts-postgres.test.ts`.

## Phase 7: Polish and Release Gates

**Purpose**: Prove the database-backed product meets the constitution and is not relying on fixtures or unverified setup claims.

- [ ] T056 [P] Add an automated route coverage assertion in `tests/contract/page-data-map.contract.test.ts` that enumerates App Router data-bearing routes and requires an entry in `specs/003-saas-admin/contracts/page-data-map.md`.
- [ ] T057 [P] Add a source guard in `tests/contract/no-runtime-demo-data.contract.test.ts` that fails if production route modules import `demo*`, `sample*`, or in-memory repositories.
- [ ] T058 Add test-database clean install, migration-upgrade, and schema-drift CI workflow in `.github/workflows/database-integration.yml`; use secrets only for non-production test configuration and never for production DB access.
- [ ] T059 Verify backup/restore and forward-only migration recovery for `teacher_helper_test` and record commands/results in `specs/003-saas-admin/quickstart.md`.
- [ ] T060 Run `pnpm test`, `pnpm test:db`, `pnpm test:e2e`, `pnpm lint`, `pnpm typecheck`, and `pnpm build`; record actual outputs and unresolved failures in `specs/003-saas-admin/quickstart.md`.
- [ ] T061 Complete constitution, accessibility, RLS, owner-bootstrap, and route-data-map release review in `specs/003-saas-admin/quickstart.md`; do not mark any phase complete without recorded evidence.

## Dependencies and Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001-T005 inspect/configure prerequisites; T002 must complete before any migration or seed operation.
- **Foundational (Phase 2)**: T006-T021 depend on the backup and schema inventory. T007 baseline approval precedes T008 migration execution. T009/T010 precede repository implementation. T012 precedes T013/T014/T017. T015/T016 precede all story repositories. T019 precedes all DB integration tests.
- **US4 (Phase 3)**: Depends on complete DB/auth foundation; T022-T025 can be authored in parallel, then implementation proceeds from T026 through route groups T027-T036. T037 verifies the complete page map.
- **US1 (Phase 4)**: Depends on US4 creating persisted centres/subscriptions and platform-owner bootstrap in Phase 2. T038-T039 can run in parallel; T040 precedes T041-T043.
- **US2 (Phase 5)**: Depends on migration 015 and US4 trial subscription creation. T044-T045 can be authored in parallel; T046 precedes T047-T049.
- **US3 (Phase 6)**: Depends on platform admin data capability from US1. T050-T051 can be authored in parallel; T052 precedes T053-T055.
- **Polish (Phase 7)**: Depends on all data-bearing route stories. T056-T059 can proceed independently after repository contracts stabilize; T060-T061 require all preceding work.

### User Story Dependencies

- **US4 (P1)**: Core persistent centre workflows; begins first after foundational infrastructure and produces the data consumed by later owner summaries.
- **US1 (P1)**: Requires persisted centre/subscription records and the provisioned platform owner from US4/foundation.
- **US2 (P1)**: Requires SaaS subscription/payment schema and centre lifecycle data from US4.
- **US3 (P2)**: Requires platform-owner authorization and safe cross-centre repository patterns from US1.

### Parallel Opportunities

- Setup: T001, T003, T004 can run in parallel; T002 backup and T005 test DB provisioning must be coordinated with DB operations.
- Foundation tests: T011, T020, T021 can be developed in parallel after the migration/DAL contracts stabilize; never run destructive reset operations against shared databases.
- US4 test authoring: T022-T025 can run in parallel. Implementation route groups may run in parallel only after T014-T016 and the migration/RLS contract complete, with different route/module ownership.
- US1: T038 and T039 can be developed in parallel; then T040-T043 follow dependency order.
- US2: T044 and T045 can be developed in parallel; then T046-T049 follow dependency order.
- US3: T050 and T051 can be developed in parallel; then T052-T055 follow dependency order.
- Polish: T056-T059 can be split after interfaces stabilize; T060-T061 are final sequential gates.

## Parallel Example: User Story 4

```text
After T014-T016 and T019 are complete:
Task: T022 onboarding persistence tests in tests/integration/onboarding-postgres.test.ts
Task: T023 people/consent/assignment tests in tests/integration/people-postgres.test.ts
Task: T024 sessions/billing/guardian-link tests in tests/integration/centre-workflows-postgres.test.ts
Task: T025 authenticated persistence E2E in tests/e2e/database-backed-centre.spec.ts
```

## Implementation Strategy

### MVP First

1. Complete safe DB reconciliation, managed OIDC, DAL, tenant transaction/RLS helpers, and isolated PostgreSQL test infrastructure.
2. Deliver US4's onboarding/settings/dashboard persistence slice and prove a record survives a fresh request under tenant RLS.
3. Deliver US1 platform-owner portfolio against persisted centres and verify safe cross-centre aggregation.
4. Deliver US2 SaaS subscription billing separately from family tuition billing.
5. Deliver US3 audited platform alert workflows.
6. Complete the full route map, live DB tests, backups/recovery, and release gates.

### Incremental Delivery

Each story requires tests against synthetic PostgreSQL data and can be demonstrated only after its independent test criteria pass. No story may substitute demo fixtures or in-memory stores for its database-backed runtime path.

## Format Validation

Every task is an unchecked checkbox with a unique sequential ID and an exact repository path. Setup/foundational/polish tasks have no story label; every story-phase task has exactly one `[US#]` label. `[P]` appears only where files and dependencies permit parallel work.
