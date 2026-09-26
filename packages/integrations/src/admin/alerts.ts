import type { OperationalAlert } from "@teacher-helper/domain";

export type AdminAlertSource = {
  listAlerts(): Promise<readonly OperationalAlert[]>;
};
