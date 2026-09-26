import type { PlatformAdminPermission, PlatformAdminRole, PlatformAdminStatus } from "./roles";

const permissionsByRole: Record<PlatformAdminRole, readonly PlatformAdminPermission[]> = {
  platform_owner: [
    "admin:read",
    "admin:billing:read",
    "admin:alerts:read",
    "admin:centre:read",
    "admin:billing:manage",
    "admin:alerts:manage",
  ],
  support_readonly: ["admin:read", "admin:billing:read", "admin:alerts:read", "admin:centre:read"],
};

export function hasPlatformAdminPermission(
  role: PlatformAdminRole,
  permission: PlatformAdminPermission,
): boolean {
  return permissionsByRole[role].includes(permission);
}

export function assertPlatformAdminPermission(
  role: PlatformAdminRole,
  permission: PlatformAdminPermission,
): void {
  if (!hasPlatformAdminPermission(role, permission)) {
    throw new Error("You are not authorized to perform this action");
  }
}

export function isActivePlatformAdmin(status: PlatformAdminStatus): boolean {
  return status === "active";
}
