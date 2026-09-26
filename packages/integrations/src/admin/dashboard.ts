import type { CentrePortfolioRecord, OperationalAlert } from "@teacher-helper/domain";

export type AdminDashboardSource = {
  listCentres(): Promise<readonly CentrePortfolioRecord[]>;
  listAlerts(): Promise<readonly OperationalAlert[]>;
};
