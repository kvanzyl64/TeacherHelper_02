import { cookies } from "next/headers";
import type { PlatformAdminIdentity } from "./roles";
import { getDatabasePool } from "../database";
import { verifyOidcIdToken } from "./oidc-provider";
import { resolveIdentity } from "./identity";
import { requirePlatformOwner } from "./dal";

export const platformAdminCookieName = "teacher_helper_oidc_id_token";

export async function getPlatformAdminSession(): Promise<PlatformAdminIdentity | null> {
  const token = (await cookies()).get(platformAdminCookieName)?.value;
  if (!token) return null;
  try {
    const claims = await verifyOidcIdToken(token);
    const client = await getDatabasePool().connect();
    try {
      return requirePlatformOwner(await resolveIdentity(client, claims));
    } finally {
      client.release();
    }
  } catch {
    return null;
  }
}
