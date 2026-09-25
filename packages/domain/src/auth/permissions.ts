import type { MembershipRole } from "./tenant-context";

export type Permission =
  | "centre:read"
  | "centre:manage"
  | "people:read"
  | "people:manage"
  | "sessions:create"
  | "sessions:approve"
  | "billing:manage"
  | "exports:create";

const permissionsByRole: Record<MembershipRole, readonly Permission[]> = {
  owner: [
    "centre:read",
    "centre:manage",
    "people:read",
    "people:manage",
    "sessions:create",
    "sessions:approve",
    "billing:manage",
    "exports:create",
  ],
  admin: [
    "centre:read",
    "centre:manage",
    "people:read",
    "people:manage",
    "sessions:create",
    "sessions:approve",
    "billing:manage",
    "exports:create",
  ],
  tutor: ["centre:read", "people:read", "sessions:create"],
};

export function hasPermission(role: MembershipRole, permission: Permission): boolean {
  return permissionsByRole[role].includes(permission);
}

export function assertPermission(role: MembershipRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new Error("You are not authorized to perform this action");
  }
}