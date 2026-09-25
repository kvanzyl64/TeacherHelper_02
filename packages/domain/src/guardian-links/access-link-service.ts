import { createHash, randomUUID } from "node:crypto";

export type AccessLinkRecordType = "session" | "resource" | "invoice" | "receipt";
export type AccessLinkStatus = "pending" | "active" | "expired" | "revoked" | "consumed";

export type AccessLink = {
  id: string;
  centreId: string;
  guardianId: string;
  studentId: string;
  recordType: AccessLinkRecordType;
  recordId: string;
  tokenDigest: string;
  status: AccessLinkStatus;
  sentAt: Date;
  expiresAt: Date;
  openedAt?: Date;
  revokedAt?: Date;
  lastFailureAt?: Date;
  createdAt: Date;
};

export function hashOpaqueToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createAccessLink(input: {
  centreId: string;
  guardianId: string;
  studentId: string;
  recordType: AccessLinkRecordType;
  recordId: string;
  token: string;
  now?: Date;
  status?: AccessLinkStatus;
}): AccessLink {
  if (!input.centreId || !input.guardianId || !input.studentId || !input.recordId || !input.token.trim()) {
    throw new Error("The access-link input is incomplete");
  }

  const now = input.now ?? new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return {
    id: randomUUID(),
    centreId: input.centreId,
    guardianId: input.guardianId,
    studentId: input.studentId,
    recordType: input.recordType,
    recordId: input.recordId,
    tokenDigest: hashOpaqueToken(input.token),
    status: input.status ?? "active",
    sentAt: now,
    expiresAt,
    createdAt: now,
  };
}

export function isAccessLinkActive(link: Pick<AccessLink, "status" | "expiresAt">, now = new Date()): boolean {
  if (link.status !== "active") {
    return false;
  }

  return now <= link.expiresAt;
}

export function revokeAccessLink(
  link: AccessLink,
  reason?: string,
  now = new Date(),
): AccessLink {
  return {
    ...link,
    status: "revoked",
    revokedAt: now,
    lastFailureAt: reason ? now : link.lastFailureAt,
  };
}

export function verifyAccessLinkToken(token: string, storedDigest: string): boolean {
  return hashOpaqueToken(token) === storedDigest;
}
