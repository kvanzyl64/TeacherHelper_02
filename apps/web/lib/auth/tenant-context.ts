import {
  resolveTenantContext,
  type ActiveMembership,
  type TenantContext,
} from "@teacher-helper/domain/src/auth/tenant-context";

export function resolveRequestTenant(input: {
  userId: string;
  centreId?: string;
  memberships: readonly ActiveMembership[];
  requestId: string;
}): TenantContext {
  return resolveTenantContext({
    userId: input.userId,
    requestedCentreId: input.centreId,
    memberships: input.memberships,
    requestId: input.requestId,
  });
}