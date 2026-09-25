import { randomUUID } from "node:crypto";

export type NotificationAuditEvent = {
  id: string;
  eventType: string;
  centreId: string;
  entityType: "notification";
  entityId: string;
  metadata: Record<string, unknown>;
  occurredAt: Date;
};

export function createNotificationAuditEvent(args: {
  centreId: string;
  entityId: string;
  eventType: string;
  metadata?: Record<string, unknown>;
  occurredAt?: Date;
}): NotificationAuditEvent {
  return {
    id: randomUUID(),
    eventType: args.eventType,
    centreId: args.centreId,
    entityType: "notification",
    entityId: args.entityId,
    metadata: args.metadata ?? {},
    occurredAt: args.occurredAt ?? new Date(),
  };
}
