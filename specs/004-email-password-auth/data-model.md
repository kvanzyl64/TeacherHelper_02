# Data Model: Email and Password Authentication

This feature adds first-party account authentication while preserving existing tenant membership,
role, guardian-link, billing, and audit boundaries.

## Account

An account is the credential-bearing identity for a centre staff member or platform administrator.

| Field | Description | Rules |
| --- | --- | --- |
| `id` | Account identifier | UUID primary key; referenced by memberships, sessions, and audit events |
| `email` | Login and contact address | Trimmed and normalized for lookup; unique within the account namespace |
| `display_name` | Human-readable name | Required; not used as an authentication factor |
| `password_hash` | One-way password verifier | Salted scrypt representation; never selected into page data or logs |
| `status` | Account access state | Centre accounts use active/pending/revoked; platform accounts use active/suspended/disabled |
| `last_password_change_at` | Password lifecycle timestamp | Updated on creation and successful password change |
| `last_login_at` | Successful sign-in timestamp | Updated only after credential verification |
| `created_at`, `updated_at` | Lifecycle timestamps | Database-managed |

Centre accounts remain related to `app.centre_memberships`, which determines centre and role
scope. Platform accounts remain related to `app.platform_admins`, which determines platform role
and status. A single email must not silently resolve to conflicting active account principals.

## Session

A server-side authenticated session grants access to an account until expiry or revocation.

| Field | Description | Rules |
| --- | --- | --- |
| `id` | Session identifier | UUID primary key |
| `account_id` | Authenticated account | Required foreign key with cascade on account deletion |
| `token_hash` | Digest of browser token | Unique fixed-length digest; raw token is never stored |
| `created_at` | Session creation time | Database-managed |
| `expires_at` | Session expiry time | Required; default planned lifetime is 8 hours |
| `revoked_at` | Explicit invalidation time | Set on sign-out, password change, disablement, or admin revocation |
| `last_seen_at` | Recent activity time | Updated under a bounded policy, not on every unbounded read |

Session validation requires an active account, an unrevoked session, and a future expiry. The
resolved account is then checked against current centre membership or platform role status.

## Password Recovery Request

A recovery request allows an account holder to set a new password without revealing account
existence to an unauthenticated requester.

| Field | Description | Rules |
| --- | --- | --- |
| `id` | Recovery request identifier | UUID primary key |
| `account_id` | Target account | Required foreign key |
| `token_hash` | Digest of recovery token | Unique; raw token is delivered only through the recovery message |
| `status` | Request lifecycle | Pending, used, revoked, or expired |
| `created_at` | Request creation time | Database-managed |
| `expires_at` | Expiry time | Default planned lifetime is 30 minutes |
| `used_at` | Completion time | Set once and never cleared |

Only a pending, unexpired request can change a password. Completion marks the request used,
revokes other outstanding requests for the account, updates the password timestamp, and revokes
existing sessions.

## Security Event

Authentication actions are recorded through the existing audit boundary or its forward-only
security-event extension.

Required event categories include successful sign-in, failed sign-in, sign-out, recovery request,
recovery completion, password change, session revocation, account disablement, and rate-limit
activation. Event metadata may include normalized non-secret identifiers and reason codes, but never
passwords, password hashes, raw tokens, session cookies, or recovery URLs.

## State Transitions

- Account: pending -> active; active -> suspended/revoked/disabled; disabled or revoked accounts cannot authenticate.
- Session: active -> expired or revoked; no transition reactivates a revoked session.
- Recovery request: pending -> used, expired, or revoked; only pending requests can be consumed.
