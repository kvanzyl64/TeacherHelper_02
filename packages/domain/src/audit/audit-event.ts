import { randomUUID } from "node:crypto";

export type AuditEventInput = {
  centreId: string;
  actorUserId?: string;
  eventType: string;
  entityType: string;
  entityId?: string;
  requestId: string;
  metadata?: Record<string, unknown>;
  occurredAt?: Date;
  retentionClass?: "student_session" | "billing" | "audit";
};

export type AuditEvent = AuditEventInput & {
  id: string;
  occurredAt: Date;
};

export function createAuditEvent(input: AuditEventInput, id = randomUUID()): AuditEvent {
  return {
    ...input,
    id,
    occurredAt: input.occurredAt ?? new Date(),
    metadata: input.metadata ?? {},
    retentionClass: input.retentionClass ?? "audit",
  };
}