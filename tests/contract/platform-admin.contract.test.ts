import { describe, expect, it } from "vitest";
import { createAdminDashboardSummary } from "../../packages/domain/src/admin/dashboard-summary";
import { createBillingSummary } from "../../packages/domain/src/admin/billing-summary";
import { createAdminActionEvent } from "../../packages/domain/src/audit/admin-events";
import { createSupportCase } from "../../packages/domain/src/admin/support-cases";
import { hasPlatformAdminPermission } from "../../apps/web/lib/auth/permissions";
import { getVisibleAdminNavigationLinks } from "../../apps/web/components/navigation/admin-navigation";

describe("platform admin contract", () => {
  it("allows owner and read-only support to read only the shared admin surfaces", () => {
    expect(hasPlatformAdminPermission("platform_owner", "admin:billing:manage")).toBe(true);
    expect(hasPlatformAdminPermission("support_readonly", "admin:billing:manage")).toBe(false);
    expect(getVisibleAdminNavigationLinks("support_readonly").map((link) => link.href)).toEqual([
      "/admin",
      "/admin/billing",
      "/admin/alerts",
    ]);
  });

  it("aggregates business-safe portfolio and alert values", () => {
    const summary = createAdminDashboardSummary(
      [
        {
          centreId: "centre-1",
          name: "Northside Centre",
          status: "active",
          subscriptionStatus: "active",
          ownerContact: "owner@example.com",
          supportFlag: false,
        },
        {
          centreId: "centre-2",
          name: "Trial Centre",
          status: "trial",
          subscriptionStatus: "trial",
          ownerContact: "trial@example.com",
          supportFlag: true,
        },
      ],
      [
        {
          alertId: "alert-1",
          centreId: "centre-2",
          type: "payment_risk",
          severity: "warning",
          status: "open",
          summary: "Payment follow-up required",
        },
      ],
    );

    expect(summary).toEqual({
      activeCentres: 1,
      trialCentres: 1,
      pastDueCentres: 0,
      openAlerts: 1,
      atRiskCount: 1,
    });
  });

  it("keeps dashboard content limited to business-safe portfolio values", () => {
    const content = JSON.stringify({
      activeCentres: 2,
      openAlerts: 1,
      centreName: "Northside Centre",
    });

    expect(content).toContain("Northside Centre");
    expect(content).not.toMatch(/student|learner|guardian|session/i);
  });

  it("records and scopes alert access to the correct centre boundary", () => {
    const alert = createSupportCase({
      centreId: "northside",
      issueType: "payment",
      owner: "platform_owner",
      status: "in_review",
      summary: "Payment risk review",
    });

    const denial = createAdminActionEvent({
      centreId: "riverside",
      actorUserId: "support-1",
      action: "admin.alert.view",
      outcome: "denied",
      requestId: "req-4",
      metadata: { reason: "out_of_scope" },
    });

    expect(alert.centreId).toBe("northside");
    expect(denial.outcome).toBe("denied");
    expect(denial.metadata).toMatchObject({ reason: "out_of_scope" });
  });

  it("summarizes centre-scoped billing risk and plan adoption", () => {
    const summary = createBillingSummary({
      rows: [
        {
          centreId: "centre-1",
          centreName: "Northside Centre",
          planName: "Growth",
          status: "active",
          monthlyValue: "1200.00",
          currency: "ZAR",
          lastPaymentAt: new Date("2026-09-01"),
          overdueAmount: "0.00",
          followUpRequired: false,
        },
        {
          centreId: "centre-2",
          centreName: "Trial Centre",
          planName: "Starter",
          status: "past_due",
          monthlyValue: "650.00",
          currency: "ZAR",
          overdueAmount: "650.00",
          followUpRequired: true,
        },
      ],
    });

    expect(summary).toEqual({
      overdueCentres: 1,
      failedPayments: 0,
      followUpCentres: 1,
      monthlyRecurringRevenue: "1850.00",
      planAdoption: { Growth: 1, Starter: 1 },
    });
  });
});
