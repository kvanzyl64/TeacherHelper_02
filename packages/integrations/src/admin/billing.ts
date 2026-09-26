import type { AdminBillingRow, PaymentEvent } from "@teacher-helper/domain";

export type AdminBillingSource = {
  listPayments(): Promise<readonly PaymentEvent[]>;
  listBillingRows(): Promise<readonly AdminBillingRow[]>;
};
