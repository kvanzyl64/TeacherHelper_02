import { createAuditEvent, type AuditEvent } from "../audit/audit-event";

export function createOnboardingAuditEvent(input: {
  centreId: string;
  actorUserId: string;
  requestId: string;
  step: "created" | "profile_saved" | "team_invite_sent";
  metadata?: Record<string, unknown>;
}): AuditEvent {
  return createAuditEvent({
    centreId: input.centreId,
    actorUserId: input.actorUserId,
    requestId: input.requestId,
    eventType: `centre.onboarding.${input.step}`,
    entityType: "centre",
    entityId: input.centreId,
    metadata: input.metadata,
    retentionClass: "audit",
  });
}
