import type { PoolClient } from "pg";
import type { MembershipRole } from "@teacher-helper/domain/src/auth/tenant-context";
import { MAX_PASSWORD_LENGTH, normalizeEmail } from "./auth-policy";
import { verifyPassword } from "./platform-admin-credentials";
import type { PlatformAdminRole } from "./roles";

const dummyPasswordHash = `scrypt$${"0".repeat(32)}$${"0".repeat(128)}`;

export type AuthMembership = {
  centreId: string;
  role: MembershipRole;
};

export type CentreAuthAccount = {
  kind: "centre";
  id: string;
  email: string;
  passwordHash: string;
  memberships: AuthMembership[];
};

export type PlatformAdminAuthAccount = {
  kind: "platform_admin";
  id: string;
  email: string;
  passwordHash: string;
  role: "platform_owner";
};

export type AuthAccount = CentreAuthAccount | PlatformAdminAuthAccount;

type AccountLookupRow = {
  principal_type: string;
  principal_id: string;
  password_hash: string | null;
  account_status: string;
  platform_role: string | null;
  memberships: unknown;
};

function parseMemberships(value: unknown): AuthMembership[] {
  let memberships = value;
  if (typeof memberships === "string") {
    try {
      memberships = JSON.parse(memberships) as unknown;
    } catch {
      return [];
    }
  }
  if (!Array.isArray(memberships)) return [];
  return memberships.filter(
    (membership): membership is AuthMembership =>
      typeof membership === "object" &&
      membership !== null &&
      typeof membership.centreId === "string" &&
      ["owner", "admin", "tutor"].includes(membership.role),
  );
}

export async function lookupAccountByEmail(
  client: Pick<PoolClient, "query">,
  email: string,
): Promise<AuthAccount | null> {
  const normalizedEmail = normalizeEmail(email);
  const result = await client.query<AccountLookupRow>(
    "SELECT * FROM app.lookup_application_accounts_by_email($1)",
    [normalizedEmail],
  );
  if (result.rows.length !== 1) return null;

  const row = result.rows[0];
  if (!row.password_hash) return null;

  if (row.principal_type === "centre") {
    const memberships = parseMemberships(row.memberships);
    if (row.account_status !== "active" || memberships.length === 0) return null;
    return {
      kind: "centre",
      id: row.principal_id,
      email: normalizedEmail,
      passwordHash: row.password_hash,
      memberships,
    };
  }

  if (
    row.principal_type === "platform_admin" &&
    row.account_status === "active" &&
    (row.platform_role as PlatformAdminRole | null) === "platform_owner"
  ) {
    return {
      kind: "platform_admin",
      id: row.principal_id,
      email: normalizedEmail,
      passwordHash: row.password_hash,
      role: "platform_owner",
    };
  }

  return null;
}

export async function authenticateAccountByEmail(
  client: Pick<PoolClient, "query">,
  email: string,
  password: string,
): Promise<AuthAccount | null> {
  const passwordWithinLimit = Array.from(password).length <= MAX_PASSWORD_LENGTH;
  let account: AuthAccount | null = null;
  try {
    const normalizedEmail = normalizeEmail(email);
    if (passwordWithinLimit) account = await lookupAccountByEmail(client, normalizedEmail);
  } catch (error) {
    if (!(error instanceof Error) || error.message !== "Invalid email address") throw error;
  }

  const passwordHash = account?.passwordHash ?? dummyPasswordHash;
  const passwordMatches = await verifyPassword(passwordWithinLimit ? password : "", passwordHash);
  return account && passwordWithinLimit && passwordMatches ? account : null;
}
