import type { OperationalAlert, SupportCase } from "@teacher-helper/domain";

export const demoAdminSupportCases: readonly SupportCase[] = [
  {
    caseId: "case-payment-riverside",
    centreId: "riverside",
    issueType: "payment",
    owner: "platform_owner",
    status: "in_review",
    summary: "Payment follow-up is under review.",
  },
  {
    caseId: "case-export-northside",
    centreId: "northside",
    issueType: "operations",
    owner: "support_readonly",
    status: "open",
    summary: "Failed export needs review by an owner.",
  },
];

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
