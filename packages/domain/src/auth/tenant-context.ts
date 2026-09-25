export type CentreId = string;
export type UserId = string;
export type MembershipRole = "owner" | "admin" | "tutor";

export type ActiveMembership = {
  centreId: CentreId;
  userId: UserId;
  role: MembershipRole;
  status: "active";
};

export type TenantContext = ActiveMembership & { requestId: string };

export class TenantContextError extends Error {
  constructor(message = "The requested workspace is unavailable") {
    super(message);
    this.name = "TenantContextError";
  }
}

export function resolveTenantContext(input: {
  userId: UserId;
  memberships: readonly ActiveMembership[];
  requestedCentreId?: CentreId;
  requestId: string;
}): TenantContext {
  const membership = input.memberships.find(
    (candidate) =>
      candidate.userId === input.userId &&
      (!input.requestedCentreId || candidate.centreId === input.requestedCentreId),
  );

  if (!membership) throw new TenantContextError();
  return { ...membership, requestId: input.requestId };
}