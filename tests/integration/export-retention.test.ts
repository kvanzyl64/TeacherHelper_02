import { describe, expect, it } from "vitest";
import {
  createExportRequest,
  processExportRequest,
  expireExportRequest,
} from "../../packages/domain/src/oversight/export-service";
import { evaluateRetentionPolicy, softDeleteRetentionRecord } from "../../packages/domain/src/oversight/retention-service";

describe("export and retention", () => {
  it("creates, processes, and expires exports for a centre", () => {
    const exported = createExportRequest({
      centreId: "centre-a",
      requestedBy: "owner-1",
      scope: "student_session",
      storageReference: "exports/centre-a/summary.csv",
    });

    expect(exported.status).toBe("requested");

    const processed = processExportRequest(exported, { ready: true });
    expect(processed.status).toBe("ready");

    const expired = expireExportRequest(processed, new Date("2026-10-05T12:00:00Z"));
    expect(expired.status).toBe("expired");
  });

  it("evaluates retention policy and soft-deletes expired policy records", () => {
    const policy = evaluateRetentionPolicy({
      retentionClass: "billing",
      createdAt: new Date("2026-01-01T00:00:00Z"),
      now: new Date("2026-12-31T00:00:00Z"),
      retentionPeriodDays: 180,
    });

    expect(policy.requiresDeletion).toBe(true);

    const softDeleted = softDeleteRetentionRecord({
      id: "inv-1",
      centreId: "centre-a",
      retentionClass: "billing",
      status: "active",
      deletedAt: undefined,
      now: new Date("2026-12-31T00:00:00Z"),
    });

    expect(softDeleted.status).toBe("deleted");
  });
});
