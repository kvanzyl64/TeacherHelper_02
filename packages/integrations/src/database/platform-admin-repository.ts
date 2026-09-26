export type PlatformCentreSummary = {
  centreId: string;
  name: string;
  status: string;
  subscriptionStatus: string | null;
  ownerContact: string | null;
  lastPaymentAt: Date | null;
  supportFlag: boolean;
};

export type PlatformAlertSummary = {
  alertId: string;
  centreId: string;
  type: string;
  severity: "info" | "warning" | "critical";
  status: "open" | "acknowledged" | "resolved";
  summary: string;
  resolvedAt: Date | null;
};

export interface PlatformAdminRepository {
  listCentres(input?: { limit?: number; offset?: number }): Promise<readonly PlatformCentreSummary[]>;
  listAlerts(input?: { limit?: number; offset?: number }): Promise<readonly PlatformAlertSummary[]>;
}