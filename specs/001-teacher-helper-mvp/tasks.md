---

description: "Executable implementation tasks for the Teacher Helper MVP Platform"
---

# Tasks: Teacher Helper MVP Platform

**Input**: Design documents from `/specs/001-teacher-helper-mvp/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included because the specification and constitution require automated authorization,
provider-contract, browser, migration, backup, and staging validation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the TypeScript web application and repository structure defined in plan.md.

- [x] T001 Install and secure local PostgreSQL for development and document the local service workflow in `infra/postgres/local/README.md`, `infra/postgres/local/init.sql`, and `infra/postgres/README.md`; development MUST use PostgreSQL, not SQLite.
- [x] T002 Create the local `teacher_helper_dev` database and least-privilege development roles in `infra/postgres/local/001_databases.sql` and `infra/postgres/local/002_roles.sql`; seed synthetic data only and keep deployment credentials out of local development.
- [x] T003 [P] Create the pnpm workspace and TypeScript configuration in `package.json`, `pnpm-workspace.yaml`, `tsconfig.json`, and `apps/web/tsconfig.json`.
- [x] T004 [P] Initialize the Next.js App Router application in `apps/web/app/` with route groups for centre, tutor, guardian links, and authentication.
- [x] T005 [P] Configure shared linting, formatting, typechecking, and test scripts in `eslint.config.mjs`, `prettier.config.mjs`, and `package.json`.
- [x] T006 [P] Create the package boundaries in `packages/domain/`, `packages/database/`, `packages/integrations/`, and `packages/test-support/` with package manifests and TypeScript entrypoints.
- [x] T007 [P] Create test roots in `apps/web/tests/`, `tests/contract/`, `tests/integration/`, and `tests/e2e/` with Vitest and Playwright configuration in `vitest.config.ts` and `playwright.config.ts`; document local database configuration in `.env.example`, `.env.development.example`, `apps/web/lib/config.ts`, and `packages/integrations/src/config.ts`, and add the CI workflow in `.github/workflows/ci.yml`.

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Complete the shared tenant, security, data, integration, and observability foundations
before any user story implementation begins.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T008 Define the PostgreSQL migration and seed layout in `packages/database/migrations/`, `packages/database/seeds/`, and `packages/database/README.md`, including expand-then-contract, development-first migration order, and rollback conventions.
- [x] T009 Create the base tenant tables and policies in `packages/database/migrations/001_centre_access.sql` for `Centre`, `User`, and `CentreMembership`, including `Centre.status` values `onboarding`, `trial`, `active`, `suspended`, `archived` and membership roles `owner`, `admin`, `tutor`.
- [x] T010 Create tenant context resolution and role authorization helpers in `packages/domain/src/auth/tenant-context.ts`, `packages/domain/src/auth/permissions.ts`, and `apps/web/lib/auth/tenant-context.ts`.
- [x] T011 [P] Implement managed authentication session handling, invitation acceptance, password recovery, expiry, and revocation in `apps/web/app/auth/`, `apps/web/lib/auth/`, and `packages/integrations/src/auth/`.
- [x] T012 [P] Implement structured audit-event creation and request correlation in `packages/domain/src/audit/`, `apps/web/lib/observability/`, and `packages/database/migrations/002_audit_events.sql`.
- [x] T013 [P] Implement protected object-storage path generation and authorization checks in `packages/integrations/src/storage/` and `apps/web/lib/storage/`; never generate public URLs for protected files.
- [x] T014 Create database row-level policies and policy-test fixtures for every tenant-scoped table in `packages/database/migrations/003_tenant_policies.sql` and `tests/integration/database/tenant-isolation.test.ts`; deny cross-centre reads, writes, file references, jobs, and exports.
- [x] T015 [P] Implement shared validation, error classification, generic unauthorized responses, rate-limit hooks, and safe logging in `packages/domain/src/validation/`, `apps/web/lib/errors/`, and `apps/web/lib/observability/safe-logging.ts`.
- [x] T016 [P] Create domain state-transition helpers in `packages/domain/src/state/` for memberships, guardian verification, sessions, access links, notifications, invoices, payments, and exports using the enums in `data-model.md`.
- [x] T017 Create the provider adapter interfaces in `packages/integrations/src/contracts/message-provider.ts`, `document-provider.ts`, and `storage-provider.ts`, including idempotency and normalized failure events.
- [x] T018 [P] Create isolated-tenant fixtures and local database reset helpers in `packages/test-support/src/tenant-fixtures.ts`, `packages/test-support/src/database-reset.ts`, and `tests/integration/test-setup.ts` without connecting to deployment databases.
- [x] T019 [P] Add foundational unit and authorization tests in `packages/domain/src/**/*.test.ts` and `tests/integration/database/tenant-isolation.test.ts` covering role scope, centre scope, generic failures, audit emission, state-transition rejection, and denial of deployment database credentials from local development.

**Checkpoint**: Tenant isolation, authentication, audit logging, storage protection, migrations, and
shared test fixtures are ready; user stories can now proceed independently.

## Phase 3: User Story 1 - Centre Onboarding and Access (Priority: P1) MVP Foundation

**Goal**: A centre owner can create an isolated trial or subscription workspace, configure essential
centre details, and invite authorised administrators and tutors.

**Independent Test**: Create Centre A and Centre B, complete setup for both, accept invitations in
both, and verify that users cannot view or change the other centre's records or actions.

### Tests for User Story 1

- [x] T020 [P] [US1] Add onboarding and duplicate-centre contract tests in `tests/contract/onboarding.contract.test.ts` covering valid creation, duplicate active name rejection, and trial/subscription selection.
- [x] T021 [P] [US1] Add cross-centre invitation and role-scope integration tests in `tests/integration/onboarding-access.test.ts` covering invitation expiry, revocation, acceptance, and denied Centre B access.
- [x] T022 [P] [US1] Add browser tests for owner onboarding and invitation acceptance in `tests/e2e/onboarding.spec.ts` at desktop and mobile viewport sizes.

### Implementation for User Story 1

- [x] T023 [P] [US1] Create centre onboarding schemas and `Centre` state validation in `packages/domain/src/centre/centre-schema.ts` using statuses `onboarding`, `trial`, `active`, `suspended`, and `archived`.
- [x] T024 [US1] Implement centre creation, duplicate-name validation, trial/subscription selection, and setup progression in `packages/domain/src/centre/onboarding-service.ts` and `apps/web/app/(centre)/onboarding/actions.ts`.
- [x] T025 [US1] Implement centre profile and operational settings persistence in `packages/domain/src/centre/centre-settings-service.ts` and `apps/web/app/(centre)/settings/centre/page.tsx`.
- [x] T026 [P] [US1] Implement administrator and tutor invitation screens and actions in `apps/web/app/(centre)/team/invite/page.tsx`, `apps/web/app/(centre)/team/invite/actions.ts`, and `apps/web/app/auth/invite/[token]/page.tsx`.
- [x] T027 [US1] Implement invitation state transitions and membership persistence in `packages/domain/src/auth/invitation-service.ts` and `packages/database/migrations/004_membership_invites.sql` using membership statuses `invited`, `active`, `revoked`, and `expired`.
- [x] T028 [US1] Add centre-scoped navigation, role guards, and generic denied responses in `apps/web/components/navigation/`, `apps/web/lib/auth/route-guards.ts`, and `apps/web/app/(centre)/layout.tsx`.
- [x] T029 [US1] Add onboarding audit events and actionable setup errors in `packages/domain/src/centre/onboarding-audit.ts` and `apps/web/app/(centre)/onboarding/error.tsx`.
- [x] T030 [US1] Run the independent onboarding test and document its evidence in `specs/001-teacher-helper-mvp/quickstart.md` under the Tenant Isolation scenario.

**Checkpoint**: US1 provides the first usable vertical slice and can be demonstrated without later
stories.

## Phase 4: User Story 2 - Student, Guardian, and Tutor Records (Priority: P1)

**Goal**: Centre staff can manage student, guardian, consent, tutor assignment, and WhatsApp-number
verification records while enforcing role and relationship visibility.

**Independent Test**: Create two students, two guardians, and one tutor; confirm one relationship and
WhatsApp number; verify administrator, tutor, and guardian-scoped views and blocked unconfirmed access.

### Tests for User Story 2

- [X] T031 [P] [US2] Add people and relationship contract tests in `tests/contract/people.contract.test.ts` covering required fields, relationship status, consent decisions, and centre-scoped uniqueness.
- [X] T032 [P] [US2] Add guardian verification integration tests in `tests/integration/guardian-verification.test.ts` covering centre confirmation, one-time code expiry, bounded attempts, successful confirmation, and revocation.
- [X] T033 [P] [US2] Add role and mobile guardian-view browser tests in `tests/e2e/people-and-verification.spec.ts` covering administrator, tutor, and passwordless phone access.

### Implementation for User Story 2

- [X] T034 [P] [US2] Create migrations and repositories for `Student`, `Guardian`, and `GuardianStudent` in `packages/database/migrations/005_people.sql` and `packages/domain/src/people/people-repository.ts`; enforce student references unique within a centre, active guardian numbers unique within a centre, and guardian relationship statuses `pending`, `active`, `revoked`.
- [X] T035 [P] [US2] Create consent and verification-challenge migrations and services in `packages/database/migrations/006_consent_verification.sql` and `packages/domain/src/people/consent-service.ts`; enforce consent decisions `granted`, `restricted`, `withdrawn`, digest-only codes, expiry, bounded attempts, and single use.
- [X] T036 [P] [US2] Create tutor assignment persistence and state validation in `packages/database/migrations/007_tutor_assignments.sql` and `packages/domain/src/people/tutor-assignment-service.ts` using statuses `pending`, `active`, `paused`, and `ended`.
- [X] T037 [US2] Implement student, guardian, consent, and assignment screens and actions in `apps/web/app/(centre)/people/`, `apps/web/features/people/`, and `apps/web/components/people/`.
- [X] T038 [US2] Implement centre-confirmed relationship and one-time WhatsApp code flows in `packages/domain/src/people/verification-service.ts`, `apps/web/app/(centre)/people/verification/`, and `packages/integrations/src/messaging/verification-messages.ts`.
- [X] T039 [US2] Implement tutor-assignment visibility filters in `packages/domain/src/people/visibility-policy.ts`, `apps/web/lib/auth/role-scope.ts`, and `apps/web/app/(tutor)/students/page.tsx`.
- [X] T040 [US2] Implement mobile-first guardian verification and unavailable states in `apps/web/app/(guardian)/verify/[challenge]/page.tsx`, `apps/web/components/guardian/`, and `apps/web/styles/guardian.css`.
- [X] T041 [US2] Emit audit events for relationship confirmation, verification attempts, consent changes, and assignment changes in `packages/domain/src/people/people-audit.ts`.
- [X] T042 [US2] Run the independent people and verification test and document evidence in `specs/001-teacher-helper-mvp/quickstart.md` under Guardian Verification and Link Scope.

**Checkpoint**: US2 can be used independently after US1 authentication and tenant foundation.

## Phase 5: User Story 3 - Session Logging and Parent Update (Priority: P1)

**Goal**: Tutors and authorised administrators can create, review, approve, and deliver sessions to
verified guardians through secure single-record WhatsApp links.

**Independent Test**: Record and approve a session, open its WhatsApp link on a narrow phone viewport,
verify only approved fields are visible, and confirm retries, expiry, revocation, and cross-record
access denial.

### Tests for User Story 3

- [ ] T043 [P] [US3] Add guardian-link contract tests in `tests/contract/guardian-link.contract.test.ts` covering opaque tokens, seven-day expiry, single-record scope, revocation, generic failures, and re-evaluated consent.
- [ ] T044 [P] [US3] Add WhatsApp delivery contract tests in `tests/contract/whatsapp-delivery.contract.test.ts` covering templates, idempotency, normalized callbacks, bounded retry, permanent failure, and no SMS/email fallback.
- [ ] T045 [P] [US3] Add session and link integration tests in `tests/integration/session-delivery.test.ts` covering draft, submitted, approved, rejected, superseded, queued, retrying, delivered, and failed states.
- [ ] T046 [P] [US3] Add mobile browser tests for session links in `tests/e2e/session-guardian-link.spec.ts` covering narrow screens, horizontal-scroll prevention, unauthorized tokens, expiry, and revocation.

### Implementation for User Story 3

- [ ] T047 [P] [US3] Create `Session` and `Resource` migrations and repositories in `packages/database/migrations/008_sessions_resources.sql` and `packages/domain/src/sessions/`; enforce review statuses `draft`, `submitted`, `approved`, `rejected`, and `superseded`.
- [ ] T048 [US3] Implement session creation, edit permissions, submission, approval, rejection, supersession, and parent-visible field policy in `packages/domain/src/sessions/session-service.ts` and `apps/web/app/(tutor)/sessions/`.
- [ ] T049 [P] [US3] Implement protected resource upload and download authorization in `packages/domain/src/sessions/resource-service.ts`, `packages/integrations/src/storage/session-resources.ts`, and `apps/web/app/(tutor)/sessions/[sessionId]/resources/`.
- [ ] T050 [US3] Implement opaque token hashing, access-link creation, open, expiry, revocation, and resend in `packages/database/migrations/009_access_links.sql`, `packages/domain/src/guardian-links/access-link-service.ts`, and `apps/web/app/(guardian)/link/[token]/page.tsx`; enforce `session`, `resource`, `invoice`, and `receipt` record types and seven-day expiry.
- [ ] T051 [US3] Implement WhatsApp message queuing, retry scheduling, provider callback normalization, idempotency, and centre failure alerts in `packages/domain/src/notifications/notification-service.ts`, `packages/integrations/src/messaging/whatsapp-provider.ts`, and `apps/web/app/api/webhooks/whatsapp/route.ts`.
- [ ] T052 [US3] Implement phone-first guardian session rendering and generic unavailable responses in `apps/web/features/guardian-link/`, `apps/web/components/guardian/session-view.tsx`, and `apps/web/styles/guardian.css`.
- [ ] T053 [US3] Emit session, access-link, notification, provider-callback, and delivery-failure audit events in `packages/domain/src/sessions/session-audit.ts` and `packages/domain/src/notifications/notification-audit.ts`.
- [ ] T054 [US3] Run the independent session delivery test and document evidence in `specs/001-teacher-helper-mvp/quickstart.md` under Guardian Verification and WhatsApp Delivery Failure.

**Checkpoint**: US3 delivers the core session-to-guardian MVP value independently after US2 identity
and verification foundations.

## Phase 6: User Story 4 - Term Invoicing and Payment Records (Priority: P1)

**Goal**: Centre users can create ZAR term invoices, deliver single-record WhatsApp invoice links,
and record manual EFT or cash payments with receipts and auditable status transitions.

**Independent Test**: Generate and issue an invoice, open its phone-friendly guardian link, record EFT
and cash payments, verify status transitions and receipts, and confirm family isolation.

### Tests for User Story 4

- [ ] T055 [P] [US4] Add invoice and receipt contract tests in `tests/contract/invoice-notification.contract.test.ts` covering ZAR totals, tax treatment, issued-value immutability, single-record links, delivery states, and approved templates.
- [ ] T056 [P] [US4] Add payment-state integration tests in `tests/integration/invoicing-payments.test.ts` covering `draft`, `issued`, `partially_paid`, `paid`, `disputed`, `failed`, and `cancelled` invoice states plus EFT, cash, and other methods.
- [ ] T057 [P] [US4] Add mobile browser tests for invoice and receipt links in `tests/e2e/invoice-guardian-link.spec.ts` covering phone rendering, family scope, expired links, and receipt visibility.

### Implementation for User Story 4

- [ ] T058 [P] [US4] Create `Invoice` and `Payment` migrations and repositories in `packages/database/migrations/010_billing.sql` and `packages/domain/src/billing/`; enforce `currency` as `ZAR`, decimal-safe amounts, payment methods `eft`, `cash`, `other`, and invoice statuses from `data-model.md`.
- [ ] T059 [US4] Implement term invoice calculation, line-item validation, tax display, issue/correction/cancellation rules, and document generation in `packages/domain/src/billing/invoice-service.ts`, `packages/integrations/src/documents/invoice-document.ts`, and `apps/web/app/(centre)/billing/invoices/`.
- [ ] T060 [US4] Implement manual payment recording, reconciliation, receipt state, and audited status transitions in `packages/domain/src/billing/payment-service.ts`, `apps/web/app/(centre)/billing/payments/`, and `apps/web/app/(centre)/billing/receipts/`.
- [ ] T061 [US4] Integrate invoice and receipt access-link creation with WhatsApp delivery in `packages/domain/src/billing/invoice-notification-service.ts` and `apps/web/app/(centre)/billing/invoices/[invoiceId]/send.ts`.
- [ ] T062 [US4] Emit invoice, payment, receipt, document, and billing-notification audit events in `packages/domain/src/billing/billing-audit.ts`.
- [ ] T063 [US4] Run the independent invoice and payment test and document evidence in `specs/001-teacher-helper-mvp/quickstart.md` under Invoice and Manual Payment.

**Checkpoint**: US4 completes the P1 payment-visibility workflow without requiring automated online
payment reconciliation.

## Phase 7: User Story 5 - Operational Oversight and Trust (Priority: P2)

**Goal**: Centre owners can review centre-scoped activity, failures, dashboard totals, and secure data
exports with retention and recovery evidence.

**Independent Test**: Seed sessions, invoices, notifications, security events, and exports; verify
centre dashboard totals, alerts, export scope, retention classes, and recovery failure handling.

### Tests for User Story 5

- [ ] T064 [P] [US5] Add dashboard aggregation and alert integration tests in `tests/integration/oversight-dashboard.test.ts` covering active students, weekly sessions, outstanding invoices, and unresolved events.
- [ ] T065 [P] [US5] Add export and retention integration tests in `tests/integration/export-retention.test.ts` covering centre scope, expiry, deletion, `student_session`, `billing`, and `audit` retention classes.
- [ ] T066 [P] [US5] Add oversight browser tests in `tests/e2e/oversight.spec.ts` covering owner-only access, actionable failures, export confirmation, and tenant isolation.

### Implementation for User Story 5

- [ ] T067 [P] [US5] Create `AuditEvent`, `ExportRequest`, and `RetentionPolicy` migrations and repositories in `packages/database/migrations/011_oversight_retention.sql` and `packages/domain/src/oversight/`; enforce export statuses `requested`, `processing`, `ready`, `failed`, `expired`, `deleted` and retention classes `student_session`, `billing`, `audit`.
- [ ] T068 [US5] Implement centre dashboard aggregation and unresolved-event queries in `packages/domain/src/oversight/dashboard-service.ts` and `apps/web/app/(centre)/dashboard/page.tsx`.
- [ ] T069 [US5] Implement scoped export creation, processing, expiry, deletion, protected download, and audit events in `packages/domain/src/oversight/export-service.ts`, `apps/web/app/(centre)/exports/`, and `packages/integrations/src/storage/exports.ts`.
- [ ] T070 [US5] Implement centrally defined retention-policy evaluation and soft-deletion workflow in `packages/domain/src/oversight/retention-service.ts` and `packages/database/migrations/012_retention_jobs.sql`.
- [ ] T071 [US5] Implement backup/recovery failure alerts and last-known-success tracking in `packages/domain/src/oversight/recovery-monitor.ts` and `apps/web/app/(centre)/operations/alerts/`.
- [ ] T072 [US5] Run the independent oversight and recovery test and document evidence in `specs/001-teacher-helper-mvp/quickstart.md` under Retention, Export, and Recovery.

**Checkpoint**: US5 provides the P2 operations layer without weakening any P1 tenant, privacy, or
payment controls.

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Harden the complete P1/P2 slice for staging and production readiness.

- [ ] T073 [P] Add accessibility labels, keyboard navigation, focus handling, responsive checks, and reduced-motion behavior across `apps/web/components/` and `apps/web/styles/`.
- [ ] T074 [P] Add structured metrics and dashboards for authorization failures, link opens, notification delivery, retries, invoice operations, exports, backup health, and latency in `apps/web/lib/observability/` and `packages/integrations/src/monitoring/`.
- [ ] T075 [P] Add rate limits and abuse controls for verification challenges, guardian-link opens, exports, invitations, and provider callbacks in `apps/web/lib/security/rate-limits.ts` and `packages/domain/src/security/abuse-controls.ts`.
- [ ] T076 [P] Add staging seed data and environment-safe provider fakes in `packages/test-support/src/staging-seeds.ts` and `packages/integrations/src/testing/provider-fakes.ts`.
- [ ] T077 Run the local development portion of `specs/001-teacher-helper-mvp/quickstart.md` against local `teacher_helper_dev` and record pass/fail evidence in `docs/release-readiness/teacher-helper-mvp-local.md`.
- [ ] T078 [P] Install PostgreSQL on the Oracle Cloud compute server, create `teacher_helper_staging` and `teacher_helper_prod`, deploy the application, and run migration dry run, backup restore rehearsal, server-side smoke tests, and staging end-to-end checks through `infra/oracle-cloud/deploy.sh`, `infra/postgres/server/`, `.github/workflows/ci.yml`, and `.github/workflows/staging-e2e.yml`.
- [ ] T079 [P] Configure daily encrypted PostgreSQL and object-storage backups, retention, completion monitoring, and disposable restore verification in `infra/postgres/server/backup/`, `infra/oracle-cloud/backup/`, and `docs/runbooks/backup-restore.md`.
- [ ] T080 [P] Provision private S3-compatible object storage with encrypted private buckets, least-privilege credentials, signed temporary access, and backup coverage in `infra/oracle-cloud/storage/`, `packages/integrations/src/storage/object-storage.ts`, and `docs/runbooks/object-storage.md`.
- [ ] T081 [P] Run the WhatsApp delivery performance test for SC-003, proving at least 95% of approved session updates produce an openable link within five minutes under pilot load, in `tests/performance/whatsapp-delivery.perf.test.ts` and `docs/release-readiness/whatsapp-performance.md`.
- [ ] T082 Run the deployed-server portion of `specs/001-teacher-helper-mvp/quickstart.md`, including storage/backup validation, and record pass/fail evidence in `docs/release-readiness/teacher-helper-mvp-server.md`.
- [ ] T083 Review tenant, child-data, retention, audit, accessibility, provider, storage, backup, and rollback controls against `.specify/memory/constitution.md` and record release approval in `docs/release-readiness/constitution-review.md`; document operator recovery, provider outage, link revocation, export deletion, and incident escalation procedures in `docs/runbooks/teacher-helper-mvp.md`.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 and T002 are sequential database prerequisites. T003-T007 can run in parallel only after T002 confirms the local PostgreSQL database and roles are ready.
- **Foundational (Phase 2)**: Depends on Setup; T011-T019 can run in parallel where they touch different packages, but T014 and T018 require the database layout from T008-T009.
- **User Stories (Phases 3-7)**: Depend on all foundational tasks. US1 is the first vertical slice; US2 depends on US1 authentication and membership; US3 depends on US2 guardian verification; US4 depends on US3 link and messaging services; US5 consumes all prior domain events and records.
- **Polish (Phase 8)**: T077 validates locally first. T078 deploys the server environment; T079-T081 can then proceed in parallel where their deployment prerequisites are ready. T082-T083 complete release review and runbook documentation.

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2; no later story dependency. Recommended MVP foundation.
- **US2 (P1)**: Depends on US1 membership and tenant context; independently testable after that boundary.
- **US3 (P1)**: Depends on US2 guardian relationship and WhatsApp-number confirmation; independently testable after those records exist.
- **US4 (P1)**: Depends on US3 access-link and WhatsApp delivery contracts; independently testable with seeded guardians.
- **US5 (P2)**: Depends on audit, billing, notification, export, and retention records from Phases 2-6.

### Parallel Opportunities

- Setup: T002-T007 after T001.
- Foundation: T011-T013, T015-T019 after their schema prerequisites.
- Within US1: T020-T022; T023 and T026 after T009/T010.
- Within US2: T031-T033; T034-T036 in separate database/domain files; T040 can proceed after T035.
- Within US3: T043-T046; T047 and T049 in separate migration/service files; T051 and T052 after T050's contract boundary.
- Within US4: T055-T057; T058 and T062 in separate files; T059 and T060 can proceed after T058.
- Within US5: T064-T066; T067 and T071 in separate concerns; T068-T070 can proceed after T067.
- Polish: T073-T076 after story completion; T079-T081 can run in parallel after T078 where their files and environments are independent.

## Parallel Example: User Story 1

```text
After T001, T008-T019 prerequisites are complete:

Task: T020 onboarding contract tests in tests/contract/onboarding.contract.test.ts
Task: T021 onboarding access integration tests in tests/integration/onboarding-access.test.ts
Task: T022 onboarding browser tests in tests/e2e/onboarding.spec.ts
Task: T023 centre schema in packages/domain/src/centre/centre-schema.ts
Task: T026 invitation UI in apps/web/app/(centre)/team/invite/
```

## Parallel Example: User Story 3

```text
After US2 verification is complete:

Task: T043 guardian-link contract tests in tests/contract/guardian-link.contract.test.ts
Task: T044 WhatsApp contract tests in tests/contract/whatsapp-delivery.contract.test.ts
Task: T047 session/resource migrations in packages/database/migrations/008_sessions_resources.sql
Task: T049 protected resource service in packages/domain/src/sessions/resource-service.ts
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 Setup and Phase 2 Foundational tenant/security work.
2. Complete US1 to establish onboarding, membership, and the first isolated workspace slice.
3. Complete US2 to establish students, guardians, consent, assignments, and verified WhatsApp numbers.
4. Complete US3 to deliver approved session updates through phone-first single-record links.
5. Complete US4 to deliver term invoices and manual payment visibility.
6. Stop and validate the P1 launch slice with the complete quickstart before starting US5.

### Incremental Delivery

1. Setup + Foundation -> security and data boundaries ready.
2. US1 -> centre onboarding demonstration.
3. US2 -> people and verification demonstration.
4. US3 -> core session-to-guardian demonstration.
5. US4 -> payment-visibility launch MVP.
6. US5 -> operational oversight and recovery hardening.
7. Polish -> staging, accessibility, observability, and production approval.

### Parallel Team Strategy

After Phase 2:

- Developer A: US1 onboarding and membership.
- Developer B: US2 people and guardian verification.
- Developer C: provider contracts and US3 messaging/link work.

After US1-US3 contracts stabilize:

- Developer A: US4 billing and payments.
- Developer B: US5 oversight and retention.
- Developer C: accessibility, observability, and release automation.

## Notes

- Every task is independently addressable, starts with `- [ ]`, has a sequential task ID, and includes
  a concrete file path.
- `[P]` appears only where tasks use separate files and have no dependency on incomplete work.
- Story labels map to the five specification user stories: `[US1]` through `[US5]`.
- The P1 launch scope is US1-US4; US1 alone is the first demonstrable vertical slice.
- No task creates the native mobile app, automated online payment reconciliation, advanced analytics,
  full white-labeling, or AI educational output; those are outside MVP scope.
