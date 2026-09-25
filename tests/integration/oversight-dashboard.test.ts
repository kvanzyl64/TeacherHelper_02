import { describe, expect, it } from "vitest";
import { createDashboardSummary } from "../../packages/domain/src/oversight/dashboard-service";

describe("oversight dashboard", () => {
  it("aggregates centre metrics for students, sessions, invoices, and unresolved events", () => {
    const summary = createDashboardSummary({
      activeStudents: 42,
      weeklySessions: 18,
      outstandingInvoices: 5,
      unresolvedEvents: 3,
      alertCount: 2,
    });

    expect(summary.activeStudents).toBe(42);
    expect(summary.weeklySessions).toBe(18);
    expect(summary.outstandingInvoices).toBe(5);
    expect(summary.unresolvedEvents).toBe(3);
    expect(summary.alertLevel).toBe("attention");
  });
});
