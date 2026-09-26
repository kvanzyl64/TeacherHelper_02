import type { CentrePortfolioRecord, OperationalAlert } from "@teacher-helper/domain";
import {
  createAdminDashboardSummary,
  type AdminDashboardSummary,
} from "@teacher-helper/domain/src/admin/dashboard-summary";

export type AdminDashboardData = {
  summary: AdminDashboardSummary;
  centres: readonly CentrePortfolioRecord[];
};

export function buildAdminDashboardData(
  centres: readonly CentrePortfolioRecord[],
  alerts: readonly OperationalAlert[],
): AdminDashboardData {
  return { summary: createAdminDashboardSummary(centres, alerts), centres };
}

export const demoAdminCentres: readonly CentrePortfolioRecord[] = [
  {
    centreId: "northside",
    name: "Northside Centre",
    status: "active",
    subscriptionStatus: "active",
    ownerContact: "hello@northside.example",
    lastPaymentAt: new Date("2026-09-01"),
    supportFlag: false,
  },
  {
    centreId: "trial-centre",
    name: "Trial Centre",
    status: "trial",
    subscriptionStatus: "trial",
    ownerContact: "owner@trial.example",
    supportFlag: true,
  },
  {
    centreId: "riverside",
    name: "Riverside Tutors",
    status: "active",
    subscriptionStatus: "past_due",
    ownerContact: "accounts@riverside.example",
    lastPaymentAt: new Date("2026-08-01"),
    supportFlag: true,
  },
];

export const demoAdminAlerts: readonly OperationalAlert[] = [
  {
    alertId: "payment-risk-riverside",
    centreId: "riverside",
    type: "payment_risk",
    severity: "warning",
    status: "open",
    summary: "Payment follow-up is required.",
  },
  {
    alertId: "export-northside",
    centreId: "northside",
    type: "export_failure",
    severity: "info",
    status: "acknowledged",
    summary: "A centre export needs review.",
  },
];
