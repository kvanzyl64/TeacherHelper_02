import type { CentrePortfolioRecord } from "./portfolio";
import type { OperationalAlert } from "./alerts";

export type AdminDashboardSummary = {
  activeCentres: number;
  trialCentres: number;
  pastDueCentres: number;
  openAlerts: number;
  atRiskCount: number;
};

export function createAdminDashboardSummary(
  centres: readonly CentrePortfolioRecord[],
  alerts: readonly OperationalAlert[],
): AdminDashboardSummary {
  return {
    activeCentres: centres.filter((centre) => centre.status === "active").length,
    trialCentres: centres.filter((centre) => centre.subscriptionStatus === "trial").length,
    pastDueCentres: centres.filter((centre) => centre.subscriptionStatus === "past_due").length,
    openAlerts: alerts.filter((alert) => alert.status !== "resolved").length,
    atRiskCount: centres.filter(
      (centre) =>
        centre.supportFlag ||
        centre.subscriptionStatus === "at_risk" ||
        centre.subscriptionStatus === "past_due",
    ).length,
  };
}
