import type { PoolClient } from "pg";
import type { MembershipRole } from "@teacher-helper/domain/src/auth/tenant-context";
import { normalizeEmail } from "./auth-policy";
import type { PlatformAdminRole } from "./roles";

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
