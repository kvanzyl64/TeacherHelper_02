# Quickstart: Email and Password Authentication

This guide validates the first-party staff and platform-owner authentication flow using synthetic
accounts. It must not use production credentials or external Auth0/OIDC configuration.

## Prerequisites

- Dependencies installed with `pnpm install`.
- Local PostgreSQL development and isolated test databases available through the repository's normal setup.
- Application environment contains the local database URL and recovery-mail delivery settings; use the `AUTH_TEST_*` names in `.env.example` for test-only account and lifetime configuration.
- Keep actual passwords and generated secrets in ignored local environment files or protected CI secrets; never commit passwords, raw tokens, cookies, recovery URLs, or external-provider settings.
- A synthetic active centre account and a synthetic active `platform_owner` account created through the approved bootstrap workflow.
- Configure `AUTH_RECOVERY_DELIVERY_URL` and its optional bearer token when using a real mail webhook. The browser recovery test instead uses a temporary `AUTH_TEST_RECOVERY_CAPTURE_SECRET` and an isolated local test database.

## Test File Map

- Authentication policy and account/session unit coverage: `apps/web/lib/auth/*.{test.ts}`.
- Login, recovery, and session contracts: `tests/contract/auth-*.contract.test.ts`.
- PostgreSQL authentication behavior: `tests/integration/email-password-auth.test.ts`.
- Authenticated browser flows: `tests/e2e/admin-auth.spec.ts` and `tests/e2e/auth-*.spec.ts`.

## Unit and contract validation

Run the credential and authentication contract tests:

```powershell
pnpm vitest run apps/web/lib/auth/platform-admin-credentials.test.ts tests/contract
```

Expected result: password hashing/verification, email normalization, generic failure behavior, and
public route contracts pass without requiring an external identity provider.

## Database validation

Run the isolated database suite:

```powershell
pnpm test:db
```

The suite must prove:

1. A valid centre account creates a session and resolves only its active centre memberships.
2. A valid platform-owner account reaches platform authorization without fabricating a centre context.
3. Invalid, disabled, suspended, or revoked accounts cannot create or use sessions.
4. Session revocation and password changes invalidate prior sessions.
5. Recovery tokens are single-use, expiring, digest-backed, and never returned in logs or audit metadata.
6. Rate limits and generic responses prevent account enumeration.
7. Guardian passwordless links continue to resolve only through their existing relationship and expiry rules.

## Browser validation

Run the application and the focused authentication browser coverage:

```powershell
pnpm dev
pnpm playwright test tests/e2e/admin-auth.spec.ts tests/e2e/design-system-accessibility.spec.ts
```

Use only test credentials supplied through protected environment variables or interactive setup.
Never place a password in a test file, command argument, screenshot, trace, or repository fixture.

To run the recovery browser flow, set `TEST_DATABASE_URL` to the local `teacher_helper_test` database,
set `PGPASSWORD` for that database user, and provide a random `AUTH_TEST_RECOVERY_CAPTURE_SECRET`.
The Playwright configuration starts a separate test server on port 3100, captures the test delivery
in memory, and disables traces for this flow so the one-time link is not recorded.

Expected browser flow:

1. Open `/auth/login` and see email/password fields without an intermediate external-provider page.
2. Submit valid test credentials and reach the authorized destination.
3. Submit invalid credentials and see the same generic error for unknown and known emails.
4. Sign out and confirm the previous session cannot open a protected route.
5. Open recovery, request a link, complete it once, and confirm the old password and old sessions no longer work.

## Verified Sign-In Results

Validated on 2026-09-27 against the local `teacher_helper_test` database:

- `pnpm exec vitest run tests/contract/auth-login.contract.test.ts tests/contract/page-map.contract.test.ts tests/contract/public-page.contract.test.ts`: 8 tests passed.
- `pnpm exec vitest run tests/integration/email-password-login.test.ts` with `TEST_DATABASE_URL` targeting `teacher_helper_test`: 1 test passed.
- `pnpm exec playwright test tests/e2e/admin-auth.spec.ts`: anonymous redirect and login-form checks passed on desktop and mobile; the two active-owner sign-in tests were skipped because `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD` were not configured.

## Release checks

Run the repository quality gates:

```powershell
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

Record authentication test evidence without recording passwords, session cookies, recovery tokens,
or external-provider configuration.
