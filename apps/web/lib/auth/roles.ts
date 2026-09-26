export type PlatformAdminRole = "platform_owner" | "support_readonly";

export type PlatformAdminStatus = "active" | "suspended" | "disabled";

export type PlatformAdminPermission =
  | "admin:read"
  | "admin:billing:read"
  | "admin:alerts:read"
  | "admin:centre:read"
  | "admin:billing:manage"
  | "admin:alerts:manage";

export type PlatformAdminIdentity = {
  id: string;
  role: PlatformAdminRole;
  status: PlatformAdminStatus;
  permissions: readonly PlatformAdminPermission[];
  lastLogin?: Date;
};
