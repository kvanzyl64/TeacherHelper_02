import { describe, expect, it } from "vitest";
import { createAdminDashboardSummary } from "../../packages/domain/src/admin/dashboard-summary";
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
});
