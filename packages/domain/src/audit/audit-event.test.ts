import { describe, expect, it } from "vitest";
import { createAuditEvent } from "./audit-event";

describe("audit events", () => {
  it("preserves request correlation and defaults to audit retention", () => {
    const event = createAuditEvent({ centreId: "centre-a", eventType: "read", entityType: "student", requestId: "req-1" }, "00000000-0000-0000-0000-000000000001");
    expect(event.requestId).toBe("req-1");
    expect(event.retentionClass).toBe("audit");
  });
});