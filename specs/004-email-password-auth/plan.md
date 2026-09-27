# Implementation Plan: Email and Password Authentication

**Branch**: `004-email-password-auth` | **Date**: 2026-09-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-email-password-auth/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Replace the incomplete OIDC-only login flow with application-owned email/password authentication
for centre staff and platform administrators. Preserve existing tenant memberships, platform roles,
guardian passwordless links, audit boundaries, and PostgreSQL persistence. Extend the existing
scrypt credential helper and digest-backed session pattern through forward-only migrations, then
validate sign-in, logout, recovery, revocation, generic errors, and rate limits end to end.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x, React 19, Next.js App Router 15.x, Node.js runtime

**Primary Dependencies**: Existing Next.js App Router, PostgreSQL via `pg`, existing domain and integration packages, Node `crypto.scrypt`, Vitest, and Playwright

**Storage**: PostgreSQL application accounts, password verifiers, sessions, recovery requests, memberships, platform roles, and audit/security events; protected HTTP-only session cookie in the browser

**Testing**: Vitest unit/contract tests, PostgreSQL integration tests against `teacher_helper_test`, Playwright authenticated browser tests, lint, typecheck, and build

**Target Platform**: Desktop and mobile browsers using the existing Teacher Helper web application

**Project Type**: Multi-tenant web application with centre staff and platform administration areas

**Performance Goals**: Normal sign-in completes within 30 seconds for a valid account; password verification remains deliberately work-factor constrained and rate-limited; no new unbounded database scans on login or recovery paths

**Constraints**: No Auth0/OIDC dependency for primary login; passwords and raw tokens never persist or enter logs; generic credential responses prevent enumeration; sessions are revocable; guardian links remain passwordless; tenant and role authorization remains server-side and RLS-backed; migrations are forward-only with backup/recovery evidence

**Scale/Scope**: Centre staff and platform-owner authentication, recovery, logout, session validation, invitation/bootstrap compatibility, security events, focused database migrations, and authenticated tests; public registration, MFA, social login, and guardian accounts are out of scope

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Tenant isolation and least privilege**: PASS with implementation gate. Every resolved account must still pass current membership, role, platform-owner, and tenant-scope checks.
- **Privacy and safeguarding**: PASS with implementation gate. Passwords, hashes, session secrets, recovery tokens, and child-data context are excluded from responses and audit metadata; guardian access remains separate and passwordless.
- **Human-controlled AI**: PASS. This feature does not alter AI suggestion approval or audit behavior.
- **Testable, observable delivery**: PASS with implementation gate. Unit, integration, and browser tests cover credential verification, session lifecycle, recovery, enumeration resistance, rate limiting, and security events.
- **Accessible and reliable workflows**: PASS with implementation gate. Login and recovery are mobile/desktop usable, have explicit loading/error/success states, and do not introduce an unexplained redirect.
- **Security and operations**: PASS with implementation gate. Use one-way password verification, protected cookies, token digests, expiry/revocation, rate limits, least-privilege database access, and forward-only migrations.

No constitution violation remains after the authentication correction. The previous OIDC requirement
was a documentation and implementation mismatch and is explicitly replaced by this feature.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
apps/web/app/auth/
├── login/                  # Email/password sign-in and server action
├── logout/                 # Session revocation endpoint/action
└── recover/                # Recovery request and completion flows

apps/web/lib/auth/
├── credentials.ts          # Shared password policy, hashing, and verification
├── session.ts              # Session creation, lookup, revocation, and cookie boundary
├── recovery.ts             # Recovery token lifecycle and delivery boundary
└── dal.ts                  # Existing authorization gateway extended for account sessions

packages/database/migrations/
└── 0xx_email_password_auth.sql

tests/
├── contract/               # Public/auth route and response contracts
├── integration/            # PostgreSQL account, recovery, session, and authorization tests
└── e2e/                    # Browser sign-in, logout, and recovery journeys
```

**Structure Decision**: Keep authentication in the existing Next.js `apps/web/app/auth` and
`apps/web/lib/auth` boundaries, with database changes as forward-only migrations and behavior tests
in the existing contract, integration, and E2E suites. Reuse the existing account, membership,
platform-admin, and audit entities instead of creating a parallel identity package.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | The feature extends existing web, database, domain, and test boundaries. |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
