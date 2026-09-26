import { assertPermission, type Permission } from "@teacher-helper/domain/src/auth/permissions";
import type { MembershipRole } from "@teacher-helper/domain/src/auth/tenant-context";
import { assertPlatformAdminPermission, isActivePlatformAdmin } from "./permissions";
import type {
  PlatformAdminIdentity,
  PlatformAdminPermission,
  PlatformAdminRole,
  PlatformAdminStatus,
} from "./roles";

export function requireCentrePermission(role: MembershipRole, permission: Permission): void {
  assertPermission(role, permission);
}

export function assertCentreScope(currentCentreId: string, requestedCentreId: string): void {
  if (currentCentreId !== requestedCentreId) {
    throw new Error("The requested resource is unavailable");
  }
}

export const genericPermissionMessage =
  "This workspace area is unavailable for your current access.";

export function requirePlatformAdmin(input: {
  role: PlatformAdminRole | null | undefined;
  status: PlatformAdminStatus;
  permission?: PlatformAdminPermission;
}): PlatformAdminIdentity {
  if (!input.role || !isActivePlatformAdmin(input.status)) {
    throw new Error(genericPermissionMessage);
  }

  const permission = input.permission ?? "admin:read";
  assertPlatformAdminPermission(input.role, permission);

  return {
    id: "platform-admin",
    role: input.role,
    status: input.status,
    permissions: [],
  };
}

export function assertPlatformAdminReadOnly(
  role: PlatformAdminRole,
  permission: PlatformAdminPermission,
): void {
  if (role === "support_readonly" && permission.endsWith(":manage")) {
    throw new Error(genericPermissionMessage);
  }
  assertPlatformAdminPermission(role, permission);
}
