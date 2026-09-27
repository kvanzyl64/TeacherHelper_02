import type { PlatformAdminIdentity } from "./roles";
import { getCurrentIdentity, requirePlatformOwner } from "./dal";
import { sessionCookieName } from "./session";

export const platformAdminCookieName = sessionCookieName;

export async function getPlatformAdminSession(): Promise<PlatformAdminIdentity | null> {
  try {
    return requirePlatformOwner(await getCurrentIdentity());
  } catch {
    return null;
  }
}
