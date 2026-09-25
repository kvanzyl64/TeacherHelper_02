import { randomUUID } from "node:crypto";

export type BillingAuditEvent = {
  id: string;
  centreId: string;
  actorUserId: string;
  eventType: string;
  entityType: "invoice" | "payment" | "receipt";
  entityId: string;
  occurredAt: Date;
  metadata: Record<string, unknown>;
};

export function createBillingAuditEvent(input: {
  centreId: string;
  actorUserId: string;
  eventType: string;
  entityType: "invoice" | "payment" | "receipt";
  entityId: string;
  occurredAt?: Date;
  metadata?: Record<string, unknown>;
}): BillingAuditEvent {
  return {
    id: randomUUID(),
    centreId: input.centreId,
    actorUserId: input.actorUserId,
    eventType: input.eventType,
    entityType: input.entityType,
    entityId: input.entityId,
    occurredAt: input.occurredAt ?? new Date(),
    metadata: input.metadata ?? {},
  };
}
