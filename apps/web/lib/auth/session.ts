import type { PoolClient } from "pg";
import {
  createOpaqueToken,
  digestSecret,
} from "../../../../packages/integrations/src/auth/session-provider";
import { SESSION_LIFETIME_SECONDS } from "./auth-policy";
import type { AuthMembership } from "./account";
import type { PlatformAdminRole, PlatformAdminStatus } from "./roles";

export const sessionCookieName = "teacher_helper_session";
export const passwordRecoveryPath = "/auth/recover";
export const invitationPath = "/auth/invite";

export type ApplicationPrincipal = {
  userId: string | null;
  platformAdminId: string | null;
};

export type ResolvedApplicationSession = ApplicationPrincipal & {
  sessionId: string;
  platformRole: PlatformAdminRole | null;
  platformStatus: PlatformAdminStatus | null;
  authenticationStatus: "active" | null;
  memberships: AuthMembership[];
};

type SessionRow = {
  session_id: string;
  user_id: string | null;
  platform_admin_id: string | null;
  platform_role: PlatformAdminRole | null;
  platform_status: PlatformAdminStatus | null;
  authentication_status: "active" | null;
  memberships: unknown;
};

export type SessionCookieStore = {
  set: (
    name: string,
    value: string,
    options: { httpOnly: boolean; secure: boolean; sameSite: "lax"; path: string; maxAge: number },
  ) => void;
  delete: (name: string) => void;
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

export function isApplicationSessionActive(
  session: { expiresAt: Date | string; revokedAt?: Date | string | null },
  now = new Date(),
): boolean {
  return !session.revokedAt && new Date(session.expiresAt).getTime() > now.getTime();
}

export async function createApplicationSession(
  client: Pick<PoolClient, "query">,
  principal: ApplicationPrincipal,
  options: { now?: Date } = {},
): Promise<{ sessionId: string; token: string; expiresAt: Date }> {
  if ((principal.userId === null) === (principal.platformAdminId === null)) {
    throw new Error("An application session requires exactly one account");
  }
  const { token, digest } = createOpaqueToken();
  const expiresAt = new Date(
    (options.now ?? new Date()).getTime() + SESSION_LIFETIME_SECONDS * 1000,
  );
  const result = await client.query<{ session_id: string | null }>(
    "SELECT app.create_application_session($1, $2, $3, $4) AS session_id",
    [principal.userId, principal.platformAdminId, digest, expiresAt],
  );
  const sessionId = result.rows[0]?.session_id;
  if (!sessionId) throw new Error("The account is unavailable");
  return { sessionId, token, expiresAt };
}

export async function resolveApplicationSession(
  client: Pick<PoolClient, "query">,
  token: string,
): Promise<ResolvedApplicationSession | null> {
  const result = await client.query<SessionRow>(
    "SELECT * FROM app.resolve_application_session($1)",
    [digestSecret(token)],
  );
  const row = result.rows[0];
  if (!row || (row.user_id === null) === (row.platform_admin_id === null)) return null;
  return {
    sessionId: row.session_id,
    userId: row.user_id,
    platformAdminId: row.platform_admin_id,
    platformRole: row.platform_role,
    platformStatus: row.platform_status,
    authenticationStatus: row.authentication_status,
    memberships: parseMemberships(row.memberships),
  };
}

export async function revokeApplicationSession(
  client: Pick<PoolClient, "query">,
  token: string,
): Promise<boolean> {
  const result = await client.query<{ revoked: boolean }>(
    "SELECT app.revoke_application_session($1) AS revoked",
    [digestSecret(token)],
  );
  return result.rows[0]?.revoked === true;
}

export async function revokeApplicationSessionsForAccount(
  client: Pick<PoolClient, "query">,
  principal: ApplicationPrincipal,
): Promise<number> {
  const result = await client.query<{ revoked_count: number }>(
    "SELECT app.revoke_application_sessions($1, $2) AS revoked_count",
    [principal.userId, principal.platformAdminId],
  );
  return Number(result.rows[0]?.revoked_count ?? 0);
}

export function setApplicationSessionCookie(store: SessionCookieStore, token: string): void {
  store.set(sessionCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_LIFETIME_SECONDS,
  });
}

export function clearApplicationSessionCookie(store: SessionCookieStore): void {
  store.delete(sessionCookieName);
}
