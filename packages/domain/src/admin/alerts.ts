export type AdminAlertType =
  "export_failure" | "retention_warning" | "backup_issue" | "payment_risk" | "support_escalation";

export type AdminAlertSeverity = "info" | "warning" | "critical";
export type AdminAlertStatus = "open" | "acknowledged" | "resolved";

export type OperationalAlert = {
  alertId: string;
  centreId: string;
  type: AdminAlertType;
  severity: AdminAlertSeverity;
  status: AdminAlertStatus;
  summary: string;
  resolvedAt?: Date;
};
