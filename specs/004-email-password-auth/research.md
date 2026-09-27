# Research: Email and Password Authentication

## Decision: Use application-owned email/password accounts

**Decision**: Centre staff and platform administrators authenticate through Teacher Helper's own email/password login page. The application owns credential verification, protected session creation, session revocation, password recovery, rate limiting, and authentication audit events. Guardian access remains passwordless and relationship-scoped.

**Rationale**: The product requirement is explicit that people sign in with an email and password. Auth0/OIDC would move the credential screen outside Teacher Helper and add an unavailable external configuration dependency. The constitution now prohibits an external provider for the primary login flow.

**Alternatives considered**:

- Auth0/OIDC: rejected because it does not match the required first-party login experience and caused the current missing-configuration loop.
- Store plaintext or reversible passwords: rejected because a credential-store compromise would expose all accounts.
- Keep separate centre and platform credential systems: rejected because it duplicates security behavior and creates inconsistent recovery and revocation rules.

## Decision: Extend existing account and session foundations through forward-only migrations

**Decision**: Preserve the existing `app.users`, `app.platform_admins`, `app.platform_admin_sessions`, memberships, and audit tables. Add the smallest forward-only schema needed for password verifiers, shared or role-aware sessions, password recovery requests, account status, and rate-limit evidence. Do not edit or replay already-applied migrations.

**Rationale**: Existing centre membership and platform role records already express authorization boundaries. Migration 013 provides a tested platform password/session shape, while migration 017 made the legacy password field nullable during the OIDC transition. A forward-only reconciliation can restore the intended password path without destroying local data or weakening tenant controls.

**Alternatives considered**:

- Replace all identity tables: rejected because it would break existing foreign keys, tenant membership, audit references, and invite flows.
- Reuse only the platform-admin session table for centre staff: rejected because the table's `admin_id` ownership cannot represent centre users without weakening referential integrity.
- Create a parallel OIDC identity mapping: rejected because the primary requirement is first-party credentials.

## Decision: Use the existing scrypt credential primitive

**Decision**: Reuse the repository's Node `scrypt` password hashing and timing-safe verification helper, with one shared credential format and explicit password policy validation. Keep raw passwords only in memory during the request and never log them.

**Rationale**: The helper already generates a random salt, derives a fixed-length key, validates the encoded format, and compares derived keys with a timing-safe operation. It avoids adding a dependency while matching the existing platform-admin credential tests.

**Alternatives considered**:

- Add bcrypt or Argon2 immediately: not required for this correction because the repository already has a reviewed scrypt primitive; reassess cost parameters during security review.
- Hash passwords in the browser: rejected because server-side verification and transport security remain required, and client hashing would become a reusable credential.

## Decision: Use opaque, digest-backed sessions and single-use recovery tokens

**Decision**: Generate high-entropy random session and recovery values, store only digests, set protected HTTP-only cookies for sessions, and validate status, expiry, revocation, and account state on every protected request. Recovery requests are single-use and expire within a short configured window.

**Rationale**: The existing `platform_admin_sessions` table and membership-invite flow establish the repository's digest-before-storage pattern. Opaque server-side sessions allow immediate logout and password-change revocation without putting authorization data in a client token.

**Alternatives considered**:

- Long-lived self-contained browser tokens: rejected because immediate revocation and account status checks are harder to guarantee.
- Store raw session or recovery tokens: rejected because database access would become direct account takeover.

## Decision: Keep errors and rate limits indistinguishable

**Decision**: Normalize email addresses for lookup, use generic sign-in and recovery responses, and rate-limit repeated attempts by account identifier and request source without disclosing whether an account exists. Record security events without passwords, raw tokens, or session secrets.

**Rationale**: This prevents email enumeration and brute-force abuse while preserving actionable user feedback. It also directly satisfies FR-008, FR-009, and FR-010.

**Open implementation choices resolved during planning**:

- Password policy: minimum 12 characters, maximum 1024 characters, with common-password rejection deferred to the account-policy task if an approved local list is available.
- Session lifetime: 8 hours by default, with revocation on sign-out, password change, account disablement, and explicit administrative revocation.
- Recovery lifetime: 30 minutes, single-use, with all earlier outstanding recovery requests revoked after successful completion.
