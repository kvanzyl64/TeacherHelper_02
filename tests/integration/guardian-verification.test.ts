import { describe, expect, it } from "vitest";
import {
  confirmGuardianRelationship,
  createVerificationService,
  revokeGuardianNumber,
} from "../../packages/domain/src/people/verification-service";

describe("guardian verification", () => {
  it("confirms a relationship and one-time WhatsApp code", async () => {
    const service = createVerificationService();
    const challenge = await service.requestNumberVerification({
      centreId: "centre-a",
      guardianId: "guardian-1",
      whatsappNumber: "27821234567",
      now: new Date("2026-09-25T10:00:00Z"),
    });

    expect(challenge.codeDigest).not.toContain(challenge.code);
    expect(await service.verifyNumber(challenge.id, challenge.code, new Date("2026-09-25T10:01:00Z"))).toMatchObject({
      status: "confirmed",
    });
    expect(confirmGuardianRelationship({ status: "pending" }, "admin-1")).toMatchObject({
      status: "active",
      relationshipConfirmedBy: "admin-1",
    });
  });

  it("expires challenges, bounds attempts, and supports revocation", async () => {
    const service = createVerificationService({ maxAttempts: 2, ttlMinutes: 5 });
    const challenge = await service.requestNumberVerification({
      centreId: "centre-a",
      guardianId: "guardian-1",
      whatsappNumber: "27821234567",
      now: new Date("2026-09-25T10:00:00Z"),
    });

    await expect(service.verifyNumber(challenge.id, "000000", new Date("2026-09-25T10:01:00Z"))).rejects.toThrow(
      "The verification code is invalid",
    );
    await expect(service.verifyNumber(challenge.id, "000000", new Date("2026-09-25T10:02:00Z"))).rejects.toThrow(
      "The verification code is no longer available",
    );
    await expect(service.verifyNumber(challenge.id, challenge.code, new Date("2026-09-25T10:03:00Z"))).rejects.toThrow(
      "The verification code is no longer available",
    );

    expect(revokeGuardianNumber({ whatsappNumberStatus: "confirmed" }, new Date("2026-09-25T10:04:00Z"))).toMatchObject({
      whatsappNumberStatus: "revoked",
    });
    await expect(
      service.verifyNumber(challenge.id, challenge.code, new Date("2026-09-25T10:10:00Z")),
    ).rejects.toThrow();
  });
});