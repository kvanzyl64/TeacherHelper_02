import type { PoolClient } from "pg";
import {
  createOpaqueToken,
  digestSecret,
} from "../../../../packages/integrations/src/auth/session-provider";
import { RECOVERY_LIFETIME_SECONDS, normalizeEmail, validatePassword } from "./auth-policy";
import { lookupAccountByEmail } from "./account";
import { hashPassword } from "./platform-admin-credentials";

const recoveryTokenPattern = /^[A-Za-z0-9_-]{43}$/;

export async function createPasswordRecoveryRequest(
  client: Pick<PoolClient, "query">,
  email: string,
  applicationUrl: string,
  options: { now?: Date } = {},
) {
  let normalizedEmail: string;
  try {
    normalizedEmail = normalizeEmail(email);
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid email address") return null;
    throw error;
  }

  const account = await lookupAccountByEmail(client, normalizedEmail);
  if (!account) return null;

  const { token, digest } = createOpaqueToken();
  const expiresAt = new Date(
    (options.now ?? new Date()).getTime() + RECOVERY_LIFETIME_SECONDS * 1000,
  );
  const userId = account.kind === "centre" ? account.id : null;
  const platformAdminId = account.kind === "platform_admin" ? account.id : null;
  const result = await client.query<{ created: boolean }>(
    "SELECT app.create_password_recovery_request($1, $2, $3, $4) AS created",
    [userId, platformAdminId, digest, expiresAt],
  );
  if (result.rows[0]?.created !== true) return null;

  const baseUrl = new URL(applicationUrl);
  if (!["http:", "https:"].includes(baseUrl.protocol)) {
    throw new Error("Recovery application URL must use HTTP or HTTPS.");
  }
  return {
    to: account.email,
    recoveryUrl: new URL(`/auth/recover/${token}`, baseUrl.origin).toString(),
    expiresAt,
  };
}

export async function isPasswordRecoveryTokenValid(
  client: Pick<PoolClient, "query">,
  token: string,
): Promise<boolean> {
  if (!recoveryTokenPattern.test(token)) return false;
  const result = await client.query<{ is_valid: boolean }>(
    "SELECT app.is_password_recovery_token_valid($1) AS is_valid",
    [digestSecret(token)],
  );
  return result.rows[0]?.is_valid === true;
}

export async function completePasswordRecovery(
  client: Pick<PoolClient, "query">,
  token: string,
  password: string,
): Promise<{ userId: string | null; platformAdminId: string | null } | null> {
  validatePassword(password);
  if (!recoveryTokenPattern.test(token)) return null;

  const passwordHash = await hashPassword(password);
  const result = await client.query<{
    user_id: string | null;
    platform_admin_id: string | null;
  }>("SELECT * FROM app.complete_password_recovery($1, $2)", [digestSecret(token), passwordHash]);
  const row = result.rows[0];
  if (!row || (row.user_id === null) === (row.platform_admin_id === null)) return null;
  return { userId: row.user_id, platformAdminId: row.platform_admin_id };
}
