import { createHash, randomInt, randomUUID } from "node:crypto";
import type { Guardian, GuardianStudent, WhatsappNumberStatus } from "./people-repository";
import { transitionState, stateGraphs } from "../state/transitions";

type ChallengeStatus = "pending" | "confirmed" | "expired" | "exhausted" | "revoked";
export type VerificationChallenge = {
  id: string;
  centreId: string;
  guardianId: string;
  channel: "whatsapp";
  purpose: "guardian_number";
  codeDigest: string;
  expiresAt: Date;
  attemptCount: number;
  status: ChallengeStatus;
  confirmedAt?: Date;
  code: string;
};

const digest = (code: string) => createHash("sha256").update(code).digest("hex");

export function confirmGuardianRelationship(relationship: Pick<GuardianStudent, "status"> & Partial<Pick<GuardianStudent, "relationshipConfirmedAt" | "relationshipConfirmedBy">>, actorUserId: string, now = new Date()): GuardianStudent {
  if (relationship.status !== "pending") throw new Error("The relationship is unavailable");
  return { ...relationship, status: "active", relationshipConfirmedAt: now, relationshipConfirmedBy: actorUserId } as GuardianStudent;
}

export function revokeGuardianNumber(guardian: Pick<Guardian, "whatsappNumberStatus"> & Partial<Guardian>, now = new Date()): Guardian {
  const status = transitionState(stateGraphs.guardianVerification, guardian.whatsappNumberStatus, "revoked") as WhatsappNumberStatus;
  return { ...guardian, whatsappNumberStatus: status, updatedAt: now } as Guardian;
}

export function createVerificationService(options: { maxAttempts?: number; ttlMinutes?: number } = {}) {
  const challenges = new Map<string, VerificationChallenge>();
  const maxAttempts = options.maxAttempts ?? 5;
  const ttlMinutes = options.ttlMinutes ?? 10;

  return {
    async requestNumberVerification(input: { centreId: string; guardianId: string; whatsappNumber: string; now?: Date }): Promise<VerificationChallenge> {
      const now = input.now ?? new Date();
      const code = randomInt(100000, 1000000).toString();
      const challenge: VerificationChallenge = {
        id: randomUUID(), centreId: input.centreId, guardianId: input.guardianId, channel: "whatsapp", purpose: "guardian_number",
        codeDigest: digest(code), expiresAt: new Date(now.getTime() + ttlMinutes * 60_000), attemptCount: 0, status: "pending", code,
      };
      challenges.set(challenge.id, challenge);
      return challenge;
    },
    async verifyNumber(id: string, code: string, now = new Date()): Promise<VerificationChallenge> {
      const challenge = challenges.get(id);
      if (!challenge || challenge.status !== "pending" || challenge.expiresAt <= now) throw new Error("The verification code is no longer available");
      if (challenge.codeDigest !== digest(code)) {
        challenge.attemptCount += 1;
        if (challenge.attemptCount >= maxAttempts) challenge.status = "exhausted";
        throw new Error(challenge.status === "exhausted" ? "The verification code is no longer available" : "The verification code is invalid");
      }
      challenge.status = "confirmed";
      challenge.confirmedAt = now;
      return challenge;
    },
  };
}