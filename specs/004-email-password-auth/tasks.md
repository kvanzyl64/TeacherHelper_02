---
description: "Executable task list for first-party email/password authentication"
---

# Tasks: Email and Password Authentication

**Input**: Design documents from `/specs/004-email-password-auth/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/auth-flow.md](contracts/auth-flow.md), [quickstart.md](quickstart.md)

**Tests**: Required by the feature specification, constitution, and quickstart. Security-sensitive behavior must have unit, PostgreSQL integration, contract, or authenticated browser coverage at the narrowest useful seam.

**Organization**: Tasks are grouped by user story. Shared account/session infrastructure is completed before story work.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the implementation seams and safe configuration needed by all authentication stories.

- [x] T001 [P] Add the authentication feature test file map and environment-variable documentation in `apps/web/lib/auth/README.md` and `specs/004-email-password-auth/quickstart.md`, explicitly excluding passwords, raw tokens, and external-provider settings from source control.
- [x] T002 [P] Add test-only account/session configuration names and safe defaults to `.env.example` and `.env.development.example` without adding credential values.
- [x] T003 [P] Add the password policy and session/recovery lifetime constants to `apps/web/lib/auth/auth-policy.ts`, using a 12-character minimum, 1024-character maximum, 8-hour session lifetime, and 30-minute recovery lifetime from `research.md`.
- [x] T004 [P] Add contract fixtures for valid centre accounts, platform-owner accounts, inactive accounts, unknown emails, and revoked sessions in `tests/contract/auth-fixtures.ts` without storing plaintext passwords outside test execution.

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the shared credential, account, session, migration, and authorization foundation. No user story implementation begins before this phase is complete.

- [x] T005 Add a forward-only PostgreSQL migration in `packages/database/migrations/021_email_password_auth.sql` for account password metadata, application sessions, password recovery requests, and authentication security events; preserve existing foreign keys and quote these constraints from `data-model.md`: `status` values, unique fixed-length token digests, pending/used/revoked/expired recovery states, and required `expires_at` timestamps.
- [x] T006 [P] Extend the database migration/status coverage in `packages/database/src/migration-status.test.ts` and `tests/integration/database-migrations.test.ts` to prove migration 021 applies after the existing baseline without editing or replaying migrations 013, 015, or 017.
- [x] T007 Implement shared email normalization and password policy validation in `apps/web/lib/auth/auth-policy.ts`, preserving case-sensitive passwords and rejecting emails outside the existing normalized account rules.
- [x] T008 [P] Refactor `apps/web/lib/auth/platform-admin-credentials.ts` into the shared credential boundary used by centre and platform accounts while preserving the existing salted scrypt format and timing-safe verification tests in `apps/web/lib/auth/platform-admin-credentials.test.ts`.
- [x] T009 Implement account lookup and role resolution in `apps/web/lib/auth/account.ts`, resolving active centre memberships and active `platform_owner` accounts while rejecting pending, revoked, suspended, and disabled accounts without revealing account existence.
- [x] T010 Implement digest-backed session creation, lookup, expiry, revocation, and protected cookie handling in `apps/web/lib/auth/session.ts`, storing only token digests and enforcing the data-model rules that sessions are revoked on sign-out, password change, disablement, or administrative revocation.
- [x] T011 [P] Implement generic authentication event recording and failed-attempt rate limiting in `apps/web/lib/auth/security-events.ts` and `apps/web/lib/auth/rate-limit.ts`; event metadata must exclude passwords, password hashes, raw tokens, session cookies, and recovery URLs.
- [x] T012 Update `apps/web/lib/auth/dal.ts`, `apps/web/lib/auth/route-guards.ts`, and `apps/web/lib/auth/platform-admin-session.ts` to resolve the new application session before applying existing centre membership, role, platform-owner, and tenant-scope authorization.
- [x] T013 [P] Add unit tests for account normalization, password policy, credential verification, generic failures, session expiry, and rate-limit decisions in `apps/web/lib/auth/auth-policy.test.ts`, `apps/web/lib/auth/account.test.ts`, `apps/web/lib/auth/session.test.ts`, and `apps/web/lib/auth/rate-limit.test.ts`.
- [x] T014 Add PostgreSQL integration coverage in `tests/integration/email-password-auth.test.ts` for account lookup, active/inactive status checks, session digest persistence, expiry, revocation, and tenant/role authorization using only synthetic accounts in `teacher_helper_test`.

**Checkpoint**: Migration 021 is applied safely, shared credential/session/account helpers pass unit tests, and database integration tests prove authorization and revocation behavior.

## Phase 3: User Story 1 - Sign In With an Account (Priority: P1) 🎯 MVP

**Goal**: Let centre staff and platform administrators sign in on the Teacher Helper login page using email and password, with no external redirect or account enumeration.

**Independent Test**: Create active synthetic centre and platform-owner accounts, submit valid credentials through `/auth/login`, verify the correct destination and protected session, then submit invalid and inactive credentials and verify the same generic failure.

### Tests for User Story 1

- [x] T015 [P] [US1] Add login contract assertions for `GET /auth/login` and `POST /auth/login` in `tests/contract/auth-login.contract.test.ts`, covering email/password fields, no external redirect, generic invalid-credential responses, and protected session-cookie behavior.
- [x] T016 [P] [US1] Add PostgreSQL sign-in integration tests in `tests/integration/email-password-login.test.ts` for active centre membership, active platform owner, unknown email, wrong password, pending/revoked user, suspended/disabled admin, and rate-limited attempts.
- [x] T017 [P] [US1] Update the authenticated browser flow in `tests/e2e/admin-auth.spec.ts` and `tests/e2e/admin-helpers.ts` to submit synthetic email/password credentials and assert the platform admin navigation without OIDC cookies or provider redirects.

### Implementation for User Story 1

- [x] T018 [US1] Replace the OIDC form in `apps/web/app/auth/login/page.tsx` with accessible email and password fields, a sign-in action, a recovery link to `/auth/recover`, generic error rendering, and no intermediate external-provider page.
- [x] T019 [US1] Replace the OIDC server action in `apps/web/app/auth/login/actions.ts` with credential normalization, account lookup, password verification, rate-limit enforcement, security-event recording, session creation, and role-aware redirect to the centre destination or `/admin`.
- [x] T020 [US1] Update `apps/web/app/auth/login/page.module.css` or the owning auth stylesheet to keep labels, errors, focus states, and the primary action usable on mobile and desktop without exposing authentication details.
- [x] T021 [US1] Update `apps/web/app/page.tsx`, `apps/web/app/auth/login/start/route.ts`, and `tests/e2e/public-home.spec.ts` so every public Login link points directly to `/auth/login` and no longer invokes the obsolete OIDC-start route.
- [x] T022 [US1] Run the focused login contract, integration, and browser tests and record the passing command/results in `specs/004-email-password-auth/quickstart.md` without recording test passwords or session values.

**Checkpoint**: US1 is independently usable: a staff member can open `/auth/login`, authenticate with email/password, reach the correct protected area, and receive generic errors for all failed cases.

## Phase 4: User Story 2 - Recover Access Securely (Priority: P1)

**Goal**: Let account holders request and complete a single-use password recovery flow without email enumeration, while invalidating prior sessions.

**Independent Test**: Request recovery for a synthetic account and an unknown email, consume a valid token once, verify the password changes, verify the old password and sessions fail, and verify expired/used tokens fail generically.

### Tests for User Story 2

- [x] T023 [P] [US2] Add recovery contract tests for `GET/POST /auth/recover` and `GET/POST /auth/recover/[token]` in `tests/contract/auth-recovery.contract.test.ts`, covering identical known/unknown confirmations, token error states, and no secret leakage.
- [x] T024 [P] [US2] Add PostgreSQL recovery integration tests in `tests/integration/email-password-recovery.test.ts` for token digest storage, 30-minute expiry, single-use consumption, revocation of outstanding requests, password replacement, and session invalidation.
- [x] T025 [P] [US2] Add authenticated browser coverage in `tests/e2e/auth-recovery.spec.ts` for recovery request, test delivery capture, valid completion, old-password rejection, and expired/used-token messaging.

### Implementation for User Story 2

- [x] T026 [US2] Implement recovery request creation and token-digest validation in `apps/web/lib/auth/recovery.ts`, enforcing pending/used/revoked/expired states and the 30-minute expiry rule from `data-model.md`.
- [x] T027 [P] [US2] Implement the recovery message delivery interface and test adapter in `packages/integrations/src/auth/password-recovery-delivery.ts` and `packages/test-support/src/fake-recovery-delivery.ts`, never logging or persisting the raw token.
- [x] T028 [US2] Implement recovery request actions in `apps/web/app/auth/recover/actions.ts` with generic responses, rate limits, audit events, and no account-existence signal.
- [x] T029 [US2] Implement the recovery request page in `apps/web/app/auth/recover/page.tsx` with accessible email input, generic confirmation, error state, and link to `/auth/login`.
- [x] T030 [US2] Add the recovery token page and completion action in `apps/web/app/auth/recover/[token]/page.tsx` and `apps/web/app/auth/recover/[token]/actions.ts`, atomically updating the password, marking the request used, revoking sessions, and redirecting to login after success.

**Checkpoint**: US2 is independently usable: account holders can recover access once, while unknown accounts, invalid tokens, and repeated attempts remain indistinguishable and safe.

## Phase 5: User Story 3 - Protect and End Authenticated Sessions (Priority: P1)

**Goal**: Ensure protected requests honor current account status and role scope, and make sign-out and administrative revocation effective immediately.

**Independent Test**: Sign in with a synthetic account, access an authorized route, sign out, replay the old cookie, disable the account, and verify all protected requests are denied and redirected to `/auth/login`.

### Tests for User Story 3

- [ ] T031 [P] [US3] Add logout and protected-route contract tests in `tests/contract/auth-session.contract.test.ts` for session-cookie clearing, revocation, expiry, and generic unauthenticated redirects.
- [ ] T032 [P] [US3] Add session lifecycle integration tests in `tests/integration/auth-session-lifecycle.test.ts` for sign-out, password-change revocation, account disablement, expiry, and pooled-connection context isolation.
- [ ] T033 [P] [US3] Add browser coverage in `tests/e2e/auth-session.spec.ts` for authorized navigation, sign-out, back-button/replay behavior, and disabled-account denial.

### Implementation for User Story 3

- [ ] T034 [US3] Implement the logout action/route in `apps/web/app/auth/logout/route.ts` and `apps/web/app/auth/logout/actions.ts` to revoke the current session, clear the protected cookie, record a security event, and redirect to `/auth/login`.
- [ ] T035 [US3] Update protected layouts and route guards in `apps/web/app/(admin)/layout.tsx`, `apps/web/app/(centre)/layout.tsx`, and `apps/web/lib/auth/route-guards.ts` to use the application session and current account/membership status on every request.
- [ ] T036 [US3] Add visible sign-out controls to `apps/web/components/navigation/workspace-shell.tsx`, `apps/web/components/navigation/admin-navigation.tsx`, and the owning navigation styles without placing session data in client state.
- [ ] T037 [US3] Add administrative session revocation and account-disable handling to `apps/web/lib/auth/session.ts`, `apps/web/lib/auth/account.ts`, and the relevant platform-admin action path; record the required security events.
- [ ] T038 [US3] Run the focused session contract, integration, and browser tests and record the passing command/results in `specs/004-email-password-auth/quickstart.md` without recording session cookies.

**Checkpoint**: US3 is independently usable: sign-out, expiry, password changes, and account disablement prevent reuse of prior sessions while authorized tenant and platform access remains intact.

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Complete security review, documentation, compatibility cleanup, and full validation across all stories.

- [ ] T039 [P] Remove obsolete OIDC login/start/callback code and dependencies from `apps/web/app/auth/login/start/route.ts`, `apps/web/app/auth/callback/route.ts`, `apps/web/app/auth/login/actions.ts`, and `apps/web/lib/auth/oidc-provider.ts` only after all application-account tests pass.
- [ ] T040 [P] Update `apps/web/scripts/create-platform-admin.mjs`, `apps/web/scripts/provision-platform-owner.mjs`, `apps/web/lib/auth/identity.ts`, and related documentation to provision application-owned accounts through hidden interactive password input and reject password command-line arguments.
- [ ] T041 [P] Update the SaaS and MVP auth references in `specs/001-teacher-helper-mvp/`, `specs/003-saas-admin/`, and `.specify/memory/constitution.md` if implementation findings require wording changes; preserve the first-party email/password decision and passwordless guardian boundary.
- [ ] T042 Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:db`, and `pnpm build`, then update `specs/004-email-password-auth/quickstart.md` with only verified outcomes and no secrets.
- [ ] T043 Run the complete authenticated desktop/mobile E2E suite and accessibility checks, confirming that login, recovery, logout, guardian passwordless links, tenant denial, and platform-owner authorization do not regress in `tests/e2e/`.
- [ ] T044 Review logs, audit events, traces, screenshots, and test fixtures for passwords, hashes, session cookies, recovery tokens, recovery URLs, and account-enumeration signals; remove any leakage before release in `apps/web/lib/observability/safe-logging.ts` and affected auth files.

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: No dependencies; setup tasks can run immediately.
- **Phase 2**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 / US1**: Depends on Phase 2; provides the MVP sign-in flow.
- **Phase 4 / US2**: Depends on Phase 2 and the credential policy from US1; can begin recovery infrastructure in parallel with US1 UI work.
- **Phase 5 / US3**: Depends on Phase 2 and the session boundary; completes protected route and logout behavior after sign-in exists.
- **Phase 6**: Depends on all required user stories and their focused validation.

### User Story Dependencies

- **US1 (P1)**: Depends only on Foundational; recommended MVP scope.
- **US2 (P1)**: Depends on shared credentials/session primitives from Foundational and integrates with US1's password policy.
- **US3 (P1)**: Depends on shared session primitives from Foundational and integrates with US1's authenticated session.

### Parallel Opportunities

- Phase 1 tasks T001-T004 can run in parallel.
- Phase 2 tasks T006, T008, T011, and T013 can run in parallel after T005's migration contract is agreed; T009-T012 depend on shared decisions but touch separate modules.
- Within US1, T015-T017 can run in parallel before T018-T021 implementation integration.
- Within US2, T023-T025 can run in parallel; T027 can run in parallel with T026 before T028-T030 integration.
- Within US3, T031-T033 can run in parallel; T034 and T036 can proceed in parallel after T010, while T035/T037 integrate the shared guard.
- After Phase 2, separate developers can work on US1, US2, and US3 in parallel if they coordinate changes to shared auth policy and session modules.

## Parallel Execution Examples

### User Story 1

```text
Task T015: tests/contract/auth-login.contract.test.ts
Task T016: tests/integration/email-password-login.test.ts
Task T017: tests/e2e/admin-auth.spec.ts and tests/e2e/admin-helpers.ts
```

### User Story 2

```text
Task T023: tests/contract/auth-recovery.contract.test.ts
Task T024: tests/integration/email-password-recovery.test.ts
Task T025: tests/e2e/auth-recovery.spec.ts
Task T027: packages/integrations/src/auth/password-recovery-delivery.ts and packages/test-support/src/fake-recovery-delivery.ts
```

### User Story 3

```text
Task T031: tests/contract/auth-session.contract.test.ts
Task T032: tests/integration/auth-session-lifecycle.test.ts
Task T033: tests/e2e/auth-session.spec.ts
Task T036: apps/web/components/navigation/workspace-shell.tsx and navigation controls
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 account, credential, session, migration, and authorization foundation.
3. Complete Phase 3 US1 sign-in and focused tests.
4. Stop and validate `/auth/login` with synthetic centre and platform-owner accounts.
5. Only then proceed to recovery and full session lifecycle.

### Incremental Delivery

1. Foundation plus US1 delivers first-party email/password sign-in.
2. US2 adds safe recovery without changing the login contract.
3. US3 adds visible logout and complete session revocation across protected routes.
4. Polish removes obsolete OIDC assumptions, verifies guardian passwordless access, and runs all release gates.

## Notes

- Every task uses the required `- [ ] T###` checklist format.
- `[P]` marks only tasks that touch separate files or can be safely parallelized.
- `[US1]`, `[US2]`, and `[US3]` map directly to the user stories in `spec.md`.
- Passwords, hashes, raw tokens, session cookies, and recovery URLs must never be committed or recorded in test output.
