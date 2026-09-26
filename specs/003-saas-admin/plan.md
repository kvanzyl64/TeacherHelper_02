# Implementation Plan: SaaS Admin

**Branch**: `003-saas-admin` | **Date**: 2026-09-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-saas-admin/spec.md`

## Summary

Complete the database-backed product foundation that the existing SaaS admin and centre pages assume: reconcile and migrate the local PostgreSQL schema, replace custom application credentials with managed OIDC identity, enforce centre scope at the data-access boundary, and map every data-bearing route to a tested repository. Then populate the SaaS-owner portfolio, subscription, billing, and operational views from restricted business-safe database queries. The initial admin release is platform-owner-only; support access is deferred until separately specified.

## Technical Context

**Language/Version**: TypeScript 5.x with React and Next.js App Router 15.x

**Primary Dependencies**: Existing Next.js App Router 15, React 19, TypeScript 5, node-postgres (`pg`), existing SQL migrations/domain packages, and a managed OIDC provider behind a server-only adapter

**Storage**: Local PostgreSQL 18 `teacher_helper_dev` for synthetic development data and isolated `teacher_helper_test` for DB integration tests. The current dev schema is partial and has no migration ledger; no current application-wide `DATABASE_URL` is configured.

**Authentication**: Managed OIDC; persist issuer/subject-to-application-role mappings only. Do not store application passwords or implement a parallel login/session system.

**Testing**: Vitest for pure domain rules; PostgreSQL integration tests for migrations, DAL authorization, RLS, repositories, and writes; Playwright for authenticated end-to-end routes using synthetic DB fixtures; lint, typecheck, build, and migration drift checks

**Target Platform**: Desktop and mobile browsers for centre owners/admins, tutors, guardians, and the platform owner

**Project Type**: Multi-tenant web application with a new platform-admin route family and reused domain services

**Performance Goals**: Use bounded/indexed server-side queries and paginated lists. Record query and route baselines against synthetic test data before setting a production SLO; do not claim an existing responsiveness target because none is specified in the repository.

**Constraints**: Constitution is authoritative. Use managed auth; resolve actual identity and role on every data request/action; set RLS context transaction-locally; runtime DB roles cannot own or bypass protected tables; business-safe platform summaries cannot expose child/guardian/session records; migrations are forward-only with backup and recovery evidence; test data must be synthetic.

**Scale/Scope**: Establish DB binding for every data-bearing route listed in `contracts/page-data-map.md`, including centre, tutor, guardian, billing, exports, operations, and platform-admin routes. Public marketing and generic error pages remain static. This cross-cutting scope is supplied by the project owner in the planning input and must be added to the feature spec before task generation.

**Planning Scope Reconciliation**: Before `/speckit-tasks`, update the spec to add the owner-provided DB-binding, managed-auth, migration/test, and route-mapping acceptance criteria. Resolve the current conflict between Story 3's read-only-support acceptance scenario and the owner-first assumption by explicitly deferring support access for release one.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Current implementation status: FAIL / release blocked.** Centre pages use hardcoded roles; most data pages use fixtures or in-memory services; managed authentication is absent; multiple tenant tables lack verified RLS; DB integration tests are absent; the local DB is partially migrated and has no application accounts.
- **Tenant isolation and least privilege: TARGET GATE.** Every page, Server Action, Route Handler, repository, export, and webhook must resolve an authenticated principal and centre membership before tenant reads/writes. Centre runtime role cannot bypass RLS. Cross-centre admin access uses a separately authorized, business-safe data path and is audited.
- **Privacy and safeguarding: TARGET GATE.** Page DTOs return only fields needed for the role/workflow. Guardian access remains link/relationship scoped. Export, retention, deletion, and audit access remain explicit.
- **Managed authentication: TARGET GATE.** Use managed OIDC. Existing custom platform password hashes and sessions cannot remain the production auth path.
- **Testable and observable delivery: TARGET GATE.** Require live PostgreSQL migration, RLS, identity, repository, billing, and notification tests, plus structured audit/operational events and authenticated E2E coverage.
- **Accessible and reliable workflows: TARGET GATE.** Preserve responsive and accessible page behavior while data states are populated, empty, loading, denied, failed, and expired.
- **Security and operations: TARGET GATE.** Back up before schema work, reconcile existing migration state, preserve forward-only migrations, and document tested restore/recovery steps.
- **Delivery gates: TARGET GATE.** Plan completion is not implementation completion. The feature cannot pass release review until all target gates above have evidence.

No constitution principle is waived. The existing custom auth path, static centre role, incomplete RLS coverage, and in-memory data sources are defects to replace, not exceptions.

## Project Structure

### Documentation (this feature)

```text
specs/003-saas-admin/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── platform-admin-ui.md
├── checklists/
│   └── requirements.md
└── tasks.md                 # Generated by /speckit-tasks
```

### Source Code (repository root)

```text
apps/web/
├── app/
│   ├── (admin)/
│   │   ├── admin/page.tsx
│   │   ├── admin/billing/page.tsx
│   │   ├── admin/alerts/page.tsx
│   │   └── centres/[centreId]/page.tsx
│   ├── (centre)/
│   └── (guardian)/
├── components/
│   ├── navigation/
│   ├── admin/
│   └── billing/
├── lib/
│   ├── auth/
│   ├── errors/
│   └── observability/
├── features/
│   └── admin/
└── tests/

packages/
├── domain/
│   ├── src/
│   │   ├── admin/
│   │   ├── billing/
│   │   └── oversight/
├── database/
├── integrations/
└── test-support/

tests/
├── contract/
├── integration/
└── e2e/
```

**Structure Decision**: Keep the single Next.js app and existing domain/integration packages. Add a server-only auth adapter, data-access layer, typed repositories, and page DTOs in the existing `apps/web/lib` and `packages/integrations` boundaries. Keep domain logic database-agnostic. Use separate tenant and platform-admin repository capabilities; do not let UI routes query `pg` directly. Add database migration status/bootstrap and test-seed commands in `packages/database`/`packages/test-support`.

## Phase 0: Research Decisions

- Use managed OIDC, with issuer/subject mapping to centre-user and platform-owner records; no custom password/session system.
- Use a server-only DAL and transaction-scoped PostgreSQL context for every tenant query.
- Keep platform-owner reporting separate from tenant role access; expose only reviewed business-safe aggregates and audit platform actions.
- Defer `support_readonly` until its release scope and operational need are explicitly approved; first release is owner-only.
- Reconcile existing migration state with a verified baseline; preserve all applied migration files and add forward-only repairs.
- Use a dedicated test database with synthetic fixtures; never use production/staging data or truncate the shared dev DB from parallel tests.

## Phase 1: Design Outputs

- [data-model.md](data-model.md) defines the platform owner, centre portfolio, subscription, payment event, alert, support case, and dashboard summary entities.
- [contracts/platform-admin-ui.md](contracts/platform-admin-ui.md) defines platform-owner access, business-safe page data, and audit behavior.
- [contracts/page-data-map.md](contracts/page-data-map.md) maps every data-bearing route to its source tables, authorization scope, and integration-test requirement.
- [quickstart.md](quickstart.md) documents safe DB reconciliation, local setup, owner provisioning, and live PostgreSQL validation.

## Implementation Phases

### Phase 0: Database and identity reconciliation

- Back up `teacher_helper_dev`; inspect tables, constraints, indexes, policies, grants, and role attributes.
- Keep migration history in a protected metadata schema outside the `app` test-data reset; the web runtime role cannot change migration state.
- Reconcile the existing platform-admin password/session migration through expand-contract; do not modify migration 013 or keep its custom password login active in the final flow.
- Create a migration ledger and verified baseline for already-present migrations. Do not replay or edit applied migration 013.
- Apply missing migrations in dependency order only after schema parity checks; add forward-only corrections for missing RLS, subscription, identity mapping, and platform audit structures.
- Configure a least-privilege application URL and separate test DB; prove `teacher_helper_app` cannot bypass RLS.
- Configure the managed OIDC provider contract and safe test identity strategy before removing custom login.

### Phase 1: Shared database/auth foundation

- Implement managed OIDC validation and identity mapping by issuer/subject.
- Implement server-only DAL functions for identity, centre membership, platform-owner permission, and narrow DTOs.
- Implement transaction helper that applies `SET LOCAL` tenant/user context and always commits/rolls back/releases its checked-out client.
- Add tenant and platform-admin repository interfaces, migration ledger/status command, synthetic seed tooling, and test DB safety guard.
- Add live PostgreSQL tests for migration status, RLS allow/deny, role boundaries, connection-context isolation, and audit writes.

### Phase 2: Centre onboarding and workspace vertical slice

- Wire onboarding, centre settings, and the centre dashboard end-to-end to PostgreSQL.
- Provision the owner membership from the verified managed identity; remove hardcoded `owner` and `centre-demo` authorization.
- Replace dashboard placeholders only with query results; empty metrics remain explicit when no records exist.
- Add authenticated E2E flow that creates a synthetic centre and verifies persisted data after navigation/reload.

### Phase 3: People, tutor, session, and guardian pages

- Wire students, guardians, relationships, consent, tutor assignments, sessions/resources, verification challenges, access links, and notifications through repositories.
- Enforce centre membership or tutor assignment on every read/write; enforce relationship, consent, and token scope for guardian access.
- Add DB integration tests for allowed and denied tenant/role/relationship cases; add synthetic E2E flows for each data-bearing page family.

### Phase 4: Centre billing, exports, retention, and operations

- Wire invoices, payments, receipts, notifications, exports, operational alerts, and retention jobs to their existing tables.
- Add RLS and indexes where missing; add explicit transactions, validation, audit events, and safe failure behavior.
- Validate state transitions, duplicate/failure handling, retention/export scope, and provider webhooks against PostgreSQL.

### Phase 5: SaaS-owner data and master account

- Replace demo portfolio/billing/alert/centre-detail fixtures with platform-admin repositories and business-safe aggregate views.
- Add/verify SaaS subscription data model; do not treat centre invoices as SaaS subscription revenue.
- Provision exactly one initial platform owner by linking a managed OIDC identity to an active platform-owner record through an audited bootstrap operation. No local password seed.
- Keep cross-centre admin data behind separate authorization/DB capability; test admin reads, denials, and audit events.

### Phase 6: Release proof

- Run all migrations against an empty test DB and a schema-reconciled local DB; verify migration drift checks.
- Run real PostgreSQL integration tests and authenticated desktop/mobile E2E tests using synthetic records.
- Verify every route in `contracts/page-data-map.md` has a repository, identity/role/tenant check, empty/failure states, and a test.
- Re-run lint, typecheck, build, accessibility, RLS, and backup/restore checks; update quickstart with actual command output only.
- Resolve or formally defer the unanswered operational response target in SC-004 before production release.

## Dependencies and Gates

- Database/app wiring does not begin against a `postgres` superuser URL. A least-privilege application URL and isolated test URL are prerequisites.
- No route is considered DB-backed until an E2E test observes a synthetic record created through the DB after a fresh request.
- No tenant repository is accepted without an RLS integration test that proves both allowed and cross-tenant denied behavior.
- Managed OIDC provider configuration and initial platform-owner identity must exist before authenticated E2E/release validation.
- Task generation must replace the currently all-checked implementation checklist with executable, dependency-ordered work derived from this plan and the expanded product-wide data requirement.

## Complexity Tracking

| Decision                                       | Why it is required                                                                     | Guardrail                                                                                           |
| ---------------------------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Separate tenant and platform-admin data access | Cross-centre admin reads cannot use arbitrary tenant context without weakening RLS     | Narrow server-only platform capability; safe views/DTOs; audit reads/actions; no child-level fields |
| Migration baseline and ledger                  | Local DB has early and late migrations applied without a ledger                        | Backup, inspect catalog, verify baseline, forward-only repair migrations, dedicated test DB         |
| Managed OIDC identity mapping                  | Constitution mandates managed authentication; current custom password flow violates it | Keep provider adapter small; store only issuer/subject and app authorization state                  |
