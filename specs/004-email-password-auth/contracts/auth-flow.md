# Authentication Flow Contract

This contract describes the user-visible and server-visible behavior for first-party staff and
platform authentication. Guardian link access is not part of this contract.

## Login

**Entry**: `GET /auth/login`

The page MUST render email and password fields, a sign-in action, and a password-recovery link.
It MUST NOT redirect to an external identity provider.

**Submission**: `POST /auth/login`

| Condition | Expected result |
| --- | --- |
| Valid active centre account and password | Create an authenticated session and redirect to the user's authorized centre destination |
| Valid active platform-owner account and password | Create an authenticated session and redirect to `/admin` |
| Invalid email/password, inactive account, or ambiguous account | Return the same generic sign-in error without revealing account existence |
| Rate limit reached | Return a generic retry-later response and record a security event |

The response MUST set only a protected session cookie. It MUST NOT return a password, password hash,
raw session token, account enumeration signal, or external-provider redirect.

## Logout

**Submission**: `POST /auth/logout`

Revoke the current session, clear the browser cookie, record a security event, and redirect to
`/auth/login`. Replaying the previous session cookie MUST fail.

## Recovery Request

**Entry**: `GET /auth/recover`

The page MUST render an email field and recovery action.

**Submission**: `POST /auth/recover`

For both known and unknown email addresses, return the same confirmation message. For a known active
account, create a single-use expiring recovery request and send the recovery message through the
configured delivery boundary. Never include account existence in the response.

## Recovery Completion

**Entry**: `GET /auth/recover/[token]`

A valid pending and unexpired token renders the new-password form. Invalid, used, revoked, or
expired tokens render an actionable generic error without exposing account details.

**Submission**: `POST /auth/recover/[token]`

Validate the password policy, atomically update the password, mark the recovery request used,
revoke all existing sessions for the account, record a security event, and redirect to login with a
success message.

## Protected Request Contract

Every protected page, Server Action, and Route Handler MUST resolve the session server-side, reject
expired or revoked sessions, check account status, and then apply the existing centre membership,
role, platform-owner, and tenant-scope authorization rules. A browser-supplied account or centre ID
is never an authority.

## Security Contract

- Passwords and raw tokens never appear in responses, logs, audit metadata, or client state.
- Email lookup is normalized, but passwords remain case-sensitive.
- Failure responses are generic and consistent.
- Session and recovery cookies/tokens are protected against script access and cross-site misuse.
- Guardian link routes remain passwordless, relationship-scoped, expiring, and separate from staff authentication.
