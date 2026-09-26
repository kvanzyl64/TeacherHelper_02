import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { PlatformAdminIdentity } from "./roles";
import { getDatabasePool } from "../database";

export const platformAdminCookieName = "teacher_helper_admin_session";
export const platformAdminSessionDurationSeconds = 12 * 60 * 60;

function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createPlatformAdminSession(adminId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + platformAdminSessionDurationSeconds * 1000);

  await getDatabasePool().query(
    `INSERT INTO app.platform_admin_sessions (admin_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [adminId, tokenHash, expiresAt],
  );

  return token;
}

export async function getPlatformAdminSession(): Promise<PlatformAdminIdentity | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(platformAdminCookieName)?.value;
  if (!token) return null;

  const result = await getDatabasePool().query<{
    id: string;
    role: PlatformAdminIdentity["role"];
    status: PlatformAdminIdentity["status"];
    last_login_at: Date | null;
  }>(
    `SELECT admin.id, admin.role, admin.status, admin.last_login_at
     FROM app.platform_admin_sessions AS session
     JOIN app.platform_admins AS admin ON admin.id = session.admin_id
     WHERE session.token_hash = $1
       AND session.revoked_at IS NULL
       AND session.expires_at > now()
       AND admin.status = 'active'`,
    [hashSessionToken(token)],
  );

  const admin = result.rows[0];
  if (!admin) return null;

  return {
    id: admin.id,
    role: admin.role,
    status: admin.status,
    permissions: [],
    lastLogin: admin.last_login_at ?? undefined,
  };
}

export async function revokePlatformAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(platformAdminCookieName)?.value;

  if (token) {
    await getDatabasePool().query(
      `UPDATE app.platform_admin_sessions
       SET revoked_at = now()
       WHERE token_hash = $1 AND revoked_at IS NULL`,
      [hashSessionToken(token)],
    );
  }

  cookieStore.delete(platformAdminCookieName);
}

export async function setPlatformAdminSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(platformAdminCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: platformAdminSessionDurationSeconds,
  });
}
