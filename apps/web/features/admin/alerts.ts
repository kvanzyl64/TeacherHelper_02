import type { OperationalAlert, SupportCase } from "@teacher-helper/domain";

export function buildAdminAlertsData(
  alerts: readonly OperationalAlert[],
  supportCases: readonly SupportCase[],
): {
  alerts: readonly OperationalAlert[];
  supportCases: readonly SupportCase[];
  openCount: number;
  severitySummary: Record<string, number>;
} {
  const severitySummary: Record<string, number> = {};

  for (const alert of alerts) {
    severitySummary[alert.severity] = (severitySummary[alert.severity] ?? 0) + 1;
  }

  return {
    alerts,
    supportCases,
    openCount: alerts.filter((alert) => alert.status !== "resolved").length,
    severitySummary,
  };
}

export function getOpenAdminAlerts(
  alerts: readonly OperationalAlert[],
): readonly OperationalAlert[] {
  return alerts.filter((alert) => alert.status !== "resolved");
}
