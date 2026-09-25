import { randomUUID } from "node:crypto";

export type NotificationKind = "session_update" | "invoice" | "verification" | "delivery_failure";
export type NotificationStatus = "queued" | "sending" | "delivered" | "failed" | "retrying" | "cancelled";
export type ProviderCallbackStatus = "accepted" | "delivered" | "read" | "failed" | "unknown";

export type NotificationRecord = {
  id: string;
  centreId: string;
  guardianId: string;
  studentId: string;
  accessLinkId: string;
  kind: NotificationKind;
  templateKey: string;
  providerMessageId?: string;
  status: NotificationStatus;
  attemptCount: number;
  idempotencyKey?: string;
  lastAttemptAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  createdAt: Date;
};

export function createNotification(input: {
  centreId: string;
  guardianId: string;
  studentId: string;
  accessLinkId: string;
  kind: NotificationKind;
  templateKey: string;
  idempotencyKey?: string;
  now?: Date;
}): NotificationRecord {
  const now = input.now ?? new Date();

  return {
    id: randomUUID(),
    centreId: input.centreId,
    guardianId: input.guardianId,
    studentId: input.studentId,
    accessLinkId: input.accessLinkId,
    kind: input.kind,
    templateKey: input.templateKey,
    status: "queued",
    attemptCount: 0,
    idempotencyKey: input.idempotencyKey,
    createdAt: now,
  };
}

export function normalizeProviderCallback(input: {
  providerMessageId?: string;
  event: string;
  occurredAt?: string | Date;
  failureReason?: string;
}): {
  providerMessageId?: string;
  status: ProviderCallbackStatus;
  occurredAt: Date;
  failureReason?: string;
  dedupeKey: string;
} {
  const status = (input.event ?? "unknown").toLowerCase() as ProviderCallbackStatus;
  const occurredAt = input.occurredAt ? new Date(input.occurredAt) : new Date();
  const dedupeKey = input.providerMessageId ?? `${status}-${occurredAt.toISOString()}`;

  return {
    providerMessageId: input.providerMessageId,
    status: ["accepted", "delivered", "read", "failed", "unknown"].includes(status) ? status : "unknown",
    occurredAt,
    failureReason: input.failureReason,
    dedupeKey,
  };
}

export function shouldRetryNotification(failureReason?: string): boolean {
  if (!failureReason) {
    return false;
  }

  const transientReasons = ["timeout", "network", "rate_limited", "temporary_service_error"];
  return transientReasons.includes(failureReason);
}

export function applyProviderCallback(
  notification: NotificationRecord,
  callback: ReturnType<typeof normalizeProviderCallback>,
): NotificationRecord {
  const next = {
    ...notification,
    providerMessageId: callback.providerMessageId ?? notification.providerMessageId,
    lastAttemptAt: callback.occurredAt,
  };

  switch (callback.status) {
    case "delivered":
    case "read":
      return { ...next, status: "delivered", deliveredAt: callback.occurredAt };
    case "failed":
      return {
        ...next,
        status: shouldRetryNotification(callback.failureReason) ? "retrying" : "failed",
        failedAt: callback.occurredAt,
        failureReason: callback.failureReason,
      };
    default:
      return { ...next, status: "sending" };
  }
}
