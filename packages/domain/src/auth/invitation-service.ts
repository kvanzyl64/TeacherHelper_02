import { randomUUID } from "node:crypto";
import type { MembershipRole } from "./tenant-context";
import { transitionState, stateGraphs } from "../state/transitions";

export type MembershipStatus = "invited" | "active" | "revoked" | "expired";

export type MembershipInvitation = {
  id: string;
  centreId: string;
  email: string;
  role: MembershipRole;
  status: MembershipStatus;
  tokenDigest: string;
  invitedAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
  revokedAt?: Date;
};

export function createMembershipInvitation(input: {
  centreId: string;
  email: string;
  role: MembershipRole;
  tokenDigest: string;
  ttlHours?: number;
  now?: Date;
}): MembershipInvitation {
  const now = input.now ?? new Date();
  const ttl = input.ttlHours ?? 72;
  return {
    id: randomUUID(),
    centreId: input.centreId,
    email: input.email.trim().toLowerCase(),
    role: input.role,
    status: "invited",
    tokenDigest: input.tokenDigest,
    invitedAt: now,
    expiresAt: new Date(now.getTime() + ttl * 60 * 60 * 1000),
  };
}

export function acceptMembershipInvitation(
  invitation: MembershipInvitation,
  now = new Date(),
): MembershipInvitation {
  if (invitation.expiresAt.getTime() <= now.getTime()) {
    return {
      ...invitation,
      status: transitionState(stateGraphs.membership, invitation.status, "expired") as MembershipStatus,
    };
  }

  return {
    ...invitation,
    status: transitionState(stateGraphs.membership, invitation.status, "active") as MembershipStatus,
    acceptedAt: now,
  };
}

export function revokeMembershipInvitation(
  invitation: MembershipInvitation,
  now = new Date(),
): MembershipInvitation {
  return {
    ...invitation,
    status: transitionState(stateGraphs.membership, invitation.status, "revoked") as MembershipStatus,
    revokedAt: now,
  };
}

export function assertInvitationScope(invitation: MembershipInvitation, centreId: string): void {
  if (invitation.centreId !== centreId) {
    throw new Error("The invitation is unavailable");
  }
}
