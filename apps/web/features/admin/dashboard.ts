import type { CentrePortfolioRecord, OperationalAlert } from "@teacher-helper/domain";
import type {
  PlatformAlertSummary,
  PlatformCentreSummary,
  PlatformDashboardSummary,
} from "@teacher-helper/integrations/src/database/platform-admin-repository";

export type AdminDashboardData = {
  summary: PlatformDashboardSummary;
  centres: readonly CentrePortfolioRecord[];
  alerts: readonly OperationalAlert[];
};

function mapCentre(centre: PlatformCentreSummary): CentrePortfolioRecord {
  return {
    centreId: centre.centreId,
    name: centre.name,
    status: centre.status === "onboarding" ? "trial" : centre.status === "archived" ? "suspended" : centre.status as CentrePortfolioRecord["status"],
    subscriptionStatus: (centre.subscriptionStatus ?? "cancelled") as CentrePortfolioRecord["subscriptionStatus"],
    ownerContact: centre.ownerContact ?? "Unavailable",
    ...(centre.lastPaymentAt ? { lastPaymentAt: centre.lastPaymentAt } : {}),
    supportFlag: centre.supportFlag,
  };
}

export function mapPlatformAlert(alert: PlatformAlertSummary): OperationalAlert {
  return {
    alertId: alert.alertId,
    centreId: alert.centreId,
    type: "payment_risk",
    severity: alert.severity,
    status: alert.status,
    summary: alert.summary,
    ...(alert.resolvedAt ? { resolvedAt: alert.resolvedAt } : {}),
  };
}

export function buildAdminDashboardData(
  summary: PlatformDashboardSummary,
  centres: readonly PlatformCentreSummary[],
  alerts: readonly PlatformAlertSummary[],
): AdminDashboardData {
  return { summary, centres: centres.map(mapCentre), alerts: alerts.map(mapPlatformAlert) };
}
