import type { PoolClient } from "pg";
import type { MembershipRole } from "@teacher-helper/domain/src/auth/tenant-context";
import { resolveIdentity, type ResolvedIdentity } from "./identity";
import type { PlatformAdminPermission, PlatformAdminIdentity } from "./roles";
import { cookies } from "next/headers";
import { getDatabasePool } from "../database";
import { verifyOidcIdToken } from "./oidc-provider";

export const genericAccessDeniedMessage = "The requested resource is unavailable";

export class AuthorizationError extends Error {
  constructor() {
    super(genericAccessDeniedMessage);
    this.name = "AuthorizationError";
  }
}

export async function requireAuthenticatedIdentity(client: Pick<PoolClient, "query">, claims: { iss: string; sub: string }): Promise<ResolvedIdentity> {
  return resolveIdentity(client, claims);
}

export async function requireCentreMembership(client: Pick<PoolClient, "query">, identity: ResolvedIdentity, centreId: string, roles?: readonly MembershipRole[]) {
  if (!identity.userId) throw new AuthorizationError();
  const result = await client.query<{ centre_id: string; user_id: string; role: MembershipRole }>(
    `SELECT centre_id, user_id, role FROM app.centre_memberships
     WHERE centre_id = $1 AND user_id = $2 AND status = 'active'`,
    [centreId, identity.userId],
  );
  const membership = result.rows[0];
  if (!membership || (roles && !roles.includes(membership.role))) throw new AuthorizationError();
  return { centreId: membership.centre_id, userId: membership.user_id, role: membership.role };
}

export async function requireTutorAssignment(client: Pick<PoolClient, "query">, identity: ResolvedIdentity, centreId: string, studentId: string): Promise<void> {
  if (!identity.userId) throw new AuthorizationError();
  const result = await client.query(
    `SELECT 1 FROM app.tutor_assignments
     WHERE centre_id = $1 AND tutor_user_id = $2 AND student_id = $3
       AND status IN ('pending', 'active', 'paused')`,
    [centreId, identity.userId, studentId],
  );
  if (result.rowCount !== 1) throw new AuthorizationError();
}

export function requirePlatformOwner(identity: ResolvedIdentity, permission: PlatformAdminPermission = "admin:read"): PlatformAdminIdentity {
  if (identity.platformRole !== "platform_owner" || identity.platformStatus !== "active" || !identity.platformAdminId) throw new AuthorizationError();
  const permissions: readonly PlatformAdminPermission[] = ["admin:read", "admin:billing:read", "admin:alerts:read", "admin:centre:read", "admin:billing:manage", "admin:alerts:manage"];
  if (!permissions.includes(permission)) throw new AuthorizationError();
  return { id: identity.platformAdminId, role: "platform_owner", status: "active", permissions };
}

export async function getCurrentIdentity(): Promise<ResolvedIdentity> {
  const token = (await cookies()).get("teacher_helper_oidc_id_token")?.value;
  if (!token) throw new AuthorizationError();
  const client = await getDatabasePool().connect();
  try {
    return await resolveIdentity(client, await verifyOidcIdToken(token));
  } finally {
    client.release();
  }
}

export async function getCurrentCentreMembership(identity: ResolvedIdentity) {
  if (!identity.userId) throw new AuthorizationError();
  const client = await getDatabasePool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config($1, $2, true)", ["app.user_id", identity.userId]);
    const result = await client.query<{ centre_id: string; user_id: string; role: MembershipRole }>(
      "SELECT centre_id, user_id, role FROM app.centre_memberships WHERE user_id = $1 AND status = 'active' ORDER BY accepted_at NULLS LAST, centre_id LIMIT 1",
      [identity.userId],
    );
    const membership = result.rows[0];
    if (!membership) throw new AuthorizationError();
    await client.query("COMMIT");
    return { centreId: membership.centre_id, userId: membership.user_id, role: membership.role };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}