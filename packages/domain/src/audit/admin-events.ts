import { randomUUID } from "node:crypto";

export type AdminActionOutcome = "allowed" | "denied";

export type AdminActionEvent = {
  id: string;
  centreId: string;
  actorUserId: string;
  action: string;
  outcome: AdminActionOutcome;
  requestId: string;
  metadata: Record<string, unknown>;
  occurredAt: Date;
};

export function createAdminActionEvent(input: {
  centreId: string;
  actorUserId: string;
  action: string;
  outcome: AdminActionOutcome;
  requestId: string;
  metadata?: Record<string, unknown>;
  occurredAt?: Date;
}): AdminActionEvent {
  return {
    id: randomUUID(),
    centreId: input.centreId,
    actorUserId: input.actorUserId,
    action: input.action,
    outcome: input.outcome,
    requestId: input.requestId,
    metadata: input.metadata ?? {},
    occurredAt: input.occurredAt ?? new Date(),
  };
}
