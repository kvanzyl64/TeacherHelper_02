import { assertPermission, type Permission } from "@teacher-helper/domain/src/auth/permissions";
import type { MembershipRole } from "@teacher-helper/domain/src/auth/tenant-context";

export function requireCentrePermission(role: MembershipRole, permission: Permission): void {
  assertPermission(role, permission);
}

export function assertCentreScope(currentCentreId: string, requestedCentreId: string): void {
  if (currentCentreId !== requestedCentreId) {
    throw new Error("The requested resource is unavailable");
  }
}
