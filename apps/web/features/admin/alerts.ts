import type { OperationalAlert } from "@teacher-helper/domain";

export function getOpenAdminAlerts(
  alerts: readonly OperationalAlert[],
): readonly OperationalAlert[] {
  return alerts.filter((alert) => alert.status !== "resolved");
}
