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
