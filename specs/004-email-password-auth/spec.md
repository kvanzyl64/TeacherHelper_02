# Feature Specification: Email and Password Authentication

**Feature Branch**: `[004-email-password-auth]`

**Created**: 2026-09-27

**Status**: Draft

**Input**: User description: "Not sure where the misunderstanding came from. specify the correct authentication. fix the constitution and spec's"

## User Scenarios & Testing

### User Story 1 - Sign in with an account (Priority: P1)

Centre staff and platform administrators need to sign in with the email address and password assigned to their Teacher Helper account so they can reach the centre or platform area appropriate to their role without being sent to an external identity provider.

**Why this priority**: Sign-in is the gateway to every protected workflow and must match the product's expected user experience.

**Independent Test**: Create an active account with a known password, submit valid credentials on the login page, and verify that the user reaches the correct authorized area.

**Acceptance Scenarios**:

1. **Given** an active centre account with a valid email and password, **When** the user submits the login form, **Then** the user is signed in and taken to the centre area allowed by their membership.
2. **Given** an active platform-owner account with a valid email and password, **When** the user submits the login form, **Then** the user is signed in and taken to SaaS administration.
3. **Given** invalid credentials, **When** the user submits the login form, **Then** the user remains on the login page, sees a generic sign-in error, and receives no indication whether the email exists.

### User Story 2 - Recover access securely (Priority: P1)

An account holder who forgets their password needs to request a recovery message and set a new password without exposing whether another person's account exists.

**Why this priority**: Account recovery is essential for an email/password system and prevents routine access problems from becoming manual support work.

**Independent Test**: Request recovery for an active account, use the expiring recovery link once, set a new password, and verify that the old password no longer works.

**Acceptance Scenarios**:

1. **Given** a user requests password recovery, **When** the request is submitted, **Then** the system shows the same confirmation whether or not the email belongs to an account.
2. **Given** a valid, unused recovery link, **When** the user sets a compliant new password, **Then** the password changes and the recovery link cannot be reused.
3. **Given** an expired, used, or revoked recovery link, **When** the user opens it, **Then** no password changes and the user receives an actionable recovery error.

### User Story 3 - Protect and end authenticated sessions (Priority: P1)

An authenticated user needs their session protected from casual disclosure and needs to sign out so a shared or lost device no longer grants access.

**Why this priority**: Authentication is incomplete unless sessions are bounded, revocable, and safe on shared devices.

**Independent Test**: Sign in, confirm protected navigation works, sign out, and verify that the previous session cannot reopen protected pages.

**Acceptance Scenarios**:

1. **Given** a valid authenticated session, **When** the user opens a protected page, **Then** the request is authorized against the account's active role and centre membership.
2. **Given** an authenticated user signs out, **When** the user requests a protected page using the previous session, **Then** access is denied and the user is sent to the login page.
3. **Given** a disabled account or revoked session, **When** the account attempts to access a protected page, **Then** access is denied even if the account presents a previously valid session.

### Edge Cases

- Repeated failed sign-in attempts are rate-limited without revealing whether the account exists.
- Email comparison is normalized consistently, while the password remains case-sensitive.
- A recovery request for an unknown email does not reveal account existence or send an observable difference in response.
- Password changes revoke existing sessions for that account.
- Centre staff, platform administrators, and guardians retain their distinct access boundaries; guardian record links remain passwordless and do not create a general guardian account.
- No external identity-provider configuration is required for the primary sign-in flow.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST provide a login page with email and password fields and a clear sign-in action.
- **FR-002**: The system MUST authenticate centre staff and platform administrators against application-owned accounts using their email and password.
- **FR-003**: The system MUST NOT require Auth0, OIDC, or another external identity provider for normal sign-in.
- **FR-004**: The system MUST store passwords only in a non-reversible, salted form and MUST never expose them in logs, responses, exports, or client-side state.
- **FR-005**: The system MUST establish a protected session only after successful credential verification and MUST apply the account's active role and centre membership to every protected request.
- **FR-006**: The system MUST provide sign-out that invalidates the current session and prevents reuse of the prior session.
- **FR-007**: The system MUST provide password recovery using single-use, expiring links and MUST revoke existing sessions after a successful password change.
- **FR-008**: The system MUST return generic sign-in and recovery responses that do not disclose whether an email address is registered.
- **FR-009**: The system MUST rate-limit repeated failed sign-in and recovery attempts.
- **FR-010**: The system MUST record auditable security events for successful sign-in, failed sign-in, sign-out, password change, recovery request, and recovery completion without storing passwords or recovery secrets.
- **FR-011**: The system MUST deny access for disabled, suspended, or revoked accounts regardless of credential or session validity.
- **FR-012**: Guardian access MUST remain passwordless, relationship-scoped, expiring, and separate from staff and platform account authentication.
- **FR-013**: Account creation, invitation, role assignment, and platform-owner provisioning MUST identify the account owner and apply the same password and session protections as sign-in.

### Key Entities

- **Account**: A centre staff or platform administrator identity with a normalized email, protected password verifier, status, and role or centre memberships.
- **Session**: A revocable, expiring authenticated login associated with one account.
- **Password Recovery Request**: A single-use, expiring request allowing an account holder to set a new password without exposing account existence.
- **Security Event**: An auditable record of authentication and recovery activity that excludes passwords and bearer secrets.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A valid account holder reaches their authorized application area within 30 seconds of submitting correct credentials on a normal connection.
- **SC-002**: 100% of protected sign-in tests use application-owned email/password credentials and require no external identity-provider configuration.
- **SC-003**: 100% of invalid-credential and unknown-email tests return indistinguishable user-facing outcomes.
- **SC-004**: 100% of successful password changes invalidate the account's previous active sessions and the recovery link used to make the change.
- **SC-005**: 100% of authentication and recovery security events contain no password, raw recovery token, or session secret.
- **SC-006**: At least 90% of representative users can complete sign-in and sign-out without encountering an unexplained intermediate page or external redirect.

## Assumptions

- Staff and platform-owner accounts are provisioned by an authorized administrator or invitation workflow; open public account registration is out of scope.
- Email delivery for recovery messages is available in environments that enable password recovery; the login flow remains usable when delivery is temporarily unavailable and gives a generic response.
- Existing guardian passwordless links remain unchanged.
- Existing tenant membership, role, audit, and PostgreSQL persistence boundaries remain authoritative.
- Password policy uses a minimum length and rejects commonly compromised passwords; the exact minimum is defined during planning.
