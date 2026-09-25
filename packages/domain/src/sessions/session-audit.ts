import { randomUUID } from "node:crypto";

export type SessionAuditEvent = {
  id: string;
  eventType: string;
  centreId: string;
  actorUserId?: string;
  entityType: "session";
  entityId: string;
  requestId?: string;
  metadata: Record<string, unknown>;
  occurredAt: Date;
};

export function createSessionAuditEvent(args: {
  centreId: string;
  entityId: string;
  eventType: string;
  actorUserId?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
  occurredAt?: Date;
}): SessionAuditEvent {
  return {
    id: randomUUID(),
    eventType: args.eventType,
    centreId: args.centreId,
    actorUserId: args.actorUserId,
    entityType: "session",
    entityId: args.entityId,
    requestId: args.requestId,
    metadata: args.metadata ?? {},
    occurredAt: args.occurredAt ?? new Date(),
  };
}
