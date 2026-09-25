import { randomUUID } from "node:crypto";

export function createPeopleAuditEvent(input: { centreId: string; actorUserId?: string; eventType: "relationship.confirmed" | "verification.attempted" | "consent.changed" | "assignment.changed"; entityType: string; entityId: string; metadata?: Record<string, unknown>; requestId?: string }) {
  return { id: randomUUID(), ...input, occurredAt: new Date(), metadata: input.metadata ?? {} };
}