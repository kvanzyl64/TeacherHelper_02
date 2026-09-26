export type PageFamily = "public" | "auth" | "centre" | "tutor" | "guardian" | "billing" | "oversight";

export type PageAudience = "visitor" | "owner" | "admin" | "tutor" | "guardian" | "staff";

export type PageSensitivity = "public" | "staff-scoped" | "guardian-scoped" | "protected-record";

export type PageStateKind =
  | "loading"
  | "empty"
  | "populated"
  | "complete"
  | "unavailable"
  | "not-found"
  | "denied"
  | "expired"
  | "revoked"
  | "failed";

export type ActionKind = "navigation" | "primary-action" | "secondary-action" | "recovery";

export type Role = "visitor" | "owner" | "admin" | "tutor" | "guardian";

export type PageSurface = {
  key: string;
  family: PageFamily;
  purpose: string;
  audience: PageAudience;
  parentKey?: string;
  primaryAction: string;
  states: readonly PageStateKind[];
  sensitivity: PageSensitivity;
};

export type NavigationLink = {
  label: string;
  sourceKey: string;
  destinationKey: string;
  audience: readonly PageAudience[];
  visibilityReason: string;
  currentState: boolean;
  actionKind: ActionKind;
};

export type RoleVisibility = {
  role: Role;
  visibleFamilies: readonly PageFamily[];
  allowedPageKeys: readonly string[];
  excludedPageKeys: readonly string[];
};

export const pageStateFixtures = {
  loading: { kind: "loading", label: "Loading" },
  empty: { kind: "empty", label: "Nothing here yet" },
  populated: { kind: "populated", label: "Available" },
  complete: { kind: "complete", label: "Complete" },
  unavailable: { kind: "unavailable", label: "Unavailable" },
  "not-found": { kind: "not-found", label: "Page not found" },
  denied: { kind: "denied", label: "Access unavailable" },
  expired: { kind: "expired", label: "Link expired" },
  revoked: { kind: "revoked", label: "Access revoked" },
  failed: { kind: "failed", label: "Something went wrong" },
} as const satisfies Record<PageStateKind, { kind: PageStateKind; label: string }>;

export const pageSurfaceFixtures = [
  {
    key: "public-home",
    family: "public",
    purpose: "Understand Teacher Helper and choose an entry path",
    audience: "visitor",
    primaryAction: "Create your centre",
    states: ["populated", "unavailable"],
    sensitivity: "public",
  },
  {
    key: "centre-dashboard",
    family: "centre",
    purpose: "See the centre at a glance",
    audience: "staff",
    parentKey: "centre-workspace",
    primaryAction: "Review centre activity",
    states: ["loading", "empty", "populated", "failed"],
    sensitivity: "staff-scoped",
  },
  {
    key: "tutor-students",
    family: "tutor",
    purpose: "Review assigned students",
    audience: "tutor",
    parentKey: "tutor-workspace",
    primaryAction: "Open a student",
    states: ["loading", "empty", "populated", "denied", "failed"],
    sensitivity: "staff-scoped",
  },
  {
    key: "guardian-link",
    family: "guardian",
    purpose: "Open an approved single-record link",
    audience: "guardian",
    parentKey: "guardian-verification",
    primaryAction: "View linked record",
    states: ["loading", "populated", "unavailable", "expired", "revoked", "denied", "failed"],
    sensitivity: "guardian-scoped",
  },
] as const satisfies readonly PageSurface[];

export const roleVisibilityFixtures = [
  { role: "visitor", visibleFamilies: ["public", "auth"], allowedPageKeys: ["public-home"], excludedPageKeys: ["centre-dashboard", "guardian-link"] },
  { role: "owner", visibleFamilies: ["centre", "billing", "oversight"], allowedPageKeys: ["centre-dashboard"], excludedPageKeys: [] },
  { role: "admin", visibleFamilies: ["centre", "billing"], allowedPageKeys: ["centre-dashboard"], excludedPageKeys: [] },
  { role: "tutor", visibleFamilies: ["tutor"], allowedPageKeys: ["tutor-students"], excludedPageKeys: ["billing", "exports", "operations"] },
  { role: "guardian", visibleFamilies: ["guardian"], allowedPageKeys: ["guardian-link"], excludedPageKeys: ["centre-dashboard"] },
] as const satisfies readonly RoleVisibility[];