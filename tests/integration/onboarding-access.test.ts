import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  acceptMembershipInvitation,
  assertInvitationScope,
  createMembershipInvitation,
  revokeMembershipInvitation,
} from "../../packages/domain/src/auth/invitation-service";

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

describe("onboarding invitations and access boundaries", () => {
  it("accepts a valid invitation", () => {
    const invitation = createMembershipInvitation({
      centreId: "centre-a",
      email: "team@example.test",
      role: "admin",
      tokenDigest: digest("token-1"),
      now: new Date("2026-09-25T10:00:00Z"),
    });

    const accepted = acceptMembershipInvitation(invitation, new Date("2026-09-25T11:00:00Z"));
    expect(accepted.status).toBe("active");
    expect(accepted.acceptedAt).toBeDefined();
  });

  it("marks expired invitations as expired when accepted after ttl", () => {
    const invitation = createMembershipInvitation({
      centreId: "centre-a",
      email: "team@example.test",
      role: "tutor",
      tokenDigest: digest("token-2"),
      ttlHours: 1,
      now: new Date("2026-09-25T08:00:00Z"),
    });

    const result = acceptMembershipInvitation(invitation, new Date("2026-09-25T10:00:00Z"));
    expect(result.status).toBe("expired");
  });

  it("revokes invitation access", () => {
    const invitation = createMembershipInvitation({
      centreId: "centre-a",
      email: "team@example.test",
      role: "tutor",
      tokenDigest: digest("token-3"),
    });

    const revoked = revokeMembershipInvitation(invitation, new Date("2026-09-25T12:00:00Z"));
    expect(revoked.status).toBe("revoked");
    expect(revoked.revokedAt).toBeDefined();
  });

  it("denies centre-b scope against a centre-a invitation", () => {
    const invitation = createMembershipInvitation({
      centreId: "centre-a",
      email: "team@example.test",
      role: "admin",
      tokenDigest: digest("token-4"),
    });

    expect(() => assertInvitationScope(invitation, "centre-b")).toThrow(
      "The invitation is unavailable",
    );
  });
});
