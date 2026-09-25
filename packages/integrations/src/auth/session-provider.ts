import { createHash, randomBytes } from "node:crypto";

export type SessionRecord = {
  id: string;
  userId: string;
  tokenDigest: string;
  expiresAt: Date;
  revokedAt?: Date;
};

export type InvitationRecord = {
  tokenDigest: string;
  email: string;
  expiresAt: Date;
  acceptedAt?: Date;
  revokedAt?: Date;
};

export function createOpaqueToken(): { token: string; digest: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, digest: digestSecret(token) };
}

export function digestSecret(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

export function isSessionActive(session: SessionRecord, now = new Date()): boolean {
  return !session.revokedAt && session.expiresAt.getTime() > now.getTime();
}

export function revokeSession(session: SessionRecord, now = new Date()): SessionRecord {
  return { ...session, revokedAt: now };
}

export function createSessionRecord(input: {
  id: string;
  userId: string;
  expiresAt: Date;
  token?: string;
}): { session: SessionRecord; token: string } {
  const generated = input.token ? { token: input.token, digest: digestSecret(input.token) } : createOpaqueToken();
  return {
    token: generated.token,
    session: { id: input.id, userId: input.userId, expiresAt: input.expiresAt, tokenDigest: generated.digest },
  };
}

export function isInvitationUsable(invitation: InvitationRecord, now = new Date()): boolean {
  return !invitation.acceptedAt && !invitation.revokedAt && invitation.expiresAt > now;
}

export function acceptInvitation(invitation: InvitationRecord, now = new Date()): InvitationRecord {
  if (!isInvitationUsable(invitation, now)) throw new Error("The invitation is unavailable");
  return { ...invitation, acceptedAt: now };
}