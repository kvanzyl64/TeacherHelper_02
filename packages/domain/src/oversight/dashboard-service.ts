export type DashboardAlertLevel = "healthy" | "attention" | "critical";

export type DashboardSummary = {
  activeStudents: number;
  weeklySessions: number;
  outstandingInvoices: number;
  unresolvedEvents: number;
  alertCount: number;
  alertLevel: DashboardAlertLevel;
};

export function createDashboardSummary(input: {
  activeStudents: number;
  weeklySessions: number;
  outstandingInvoices: number;
  unresolvedEvents: number;
  alertCount?: number;
}): DashboardSummary {
  const alertCount = input.alertCount ?? Math.max(input.unresolvedEvents, 0);
  const alertLevel: DashboardAlertLevel =
    alertCount > 5 ? "critical" : alertCount > 0 ? "attention" : "healthy";

  return {
    activeStudents: input.activeStudents,
    weeklySessions: input.weeklySessions,
    outstandingInvoices: input.outstandingInvoices,
    unresolvedEvents: input.unresolvedEvents,
    alertCount,
    alertLevel,
  };
}
