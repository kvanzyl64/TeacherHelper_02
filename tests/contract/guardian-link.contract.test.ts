import { describe, expect, it } from "vitest";
import {
  createAccessLink,
  hashOpaqueToken,
  isAccessLinkActive,
  revokeAccessLink,
} from "../../packages/domain/src/guardian-links/access-link-service";

describe("guardian-link contract", () => {
  it("creates opaque, seven-day access links with a secure token digest", () => {
    const now = new Date("2026-09-25T10:00:00Z");
    const link = createAccessLink({
      centreId: "centre-a",
      guardianId: "guardian-1",
      studentId: "student-1",
      recordType: "session",
      recordId: "session-1",
      token: "s3cr3t-token",
      now,
    });

    expect(link.tokenDigest).not.toBe("s3cr3t-token");
    expect(hashOpaqueToken("s3cr3t-token")).toBe(link.tokenDigest);
    expect(link.status).toBe("active");
    expect(link.expiresAt.getTime() - now.getTime()).toBeGreaterThan(6 * 24 * 60 * 60 * 1000);
    expect(isAccessLinkActive(link, now)).toBe(true);
  });

  it("revokes links and rejects expired or revoked links", () => {
    const now = new Date("2026-09-25T11:00:00Z");
    const link = createAccessLink({
      centreId: "centre-a",
      guardianId: "guardian-1",
      studentId: "student-1",
      recordType: "resource",
      recordId: "resource-1",
      token: "token-9",
      now,
    });

    const revoked = revokeAccessLink(link, "consent_changed", now);
    expect(revoked.status).toBe("revoked");
    expect(isAccessLinkActive(revoked, new Date("2026-09-26T09:00:00Z"))).toBe(false);

    const expired = createAccessLink({
      centreId: "centre-a",
      guardianId: "guardian-1",
      studentId: "student-1",
      recordType: "invoice",
      recordId: "invoice-1",
      token: "token-expired",
      now: new Date("2026-07-01T09:00:00Z"),
    });
    expect(isAccessLinkActive(expired, new Date("2026-07-09T09:00:00Z"))).toBe(false);
  });
});
