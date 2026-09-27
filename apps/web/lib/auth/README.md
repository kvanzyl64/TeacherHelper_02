# Authentication Test Map

| Coverage                            | File                                                                                                |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- |
| Credential hashing and verification | `platform-admin-credentials.test.ts`                                                                |
| Account, email, and password policy | `auth-policy.test.ts`, `account.test.ts`                                                            |
| Session lifecycle and rate limiting | `session.test.ts`, `rate-limit.test.ts`                                                             |
| Login and recovery contracts        | `tests/contract/auth-login.contract.test.ts`, `tests/contract/auth-recovery.contract.test.ts`       |
| Database behavior                   | `tests/integration/email-password-auth.test.ts`                                                     |
| Authenticated browser flows         | `tests/e2e/admin-auth.spec.ts`, `tests/e2e/auth-recovery.spec.ts`, `tests/e2e/auth-session.spec.ts` |

## Test Configuration

`.env.example` and `.env.development.example` document test-only account and lifetime settings.
Keep actual credentials and generated secrets in an ignored local environment file or a protected
CI secret store. Never commit passwords, password hashes, raw session or recovery tokens, cookies,
or recovery URLs. External identity-provider settings are not part of the primary sign-in flow and
must not be added to these examples.
