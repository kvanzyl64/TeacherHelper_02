import type { PaymentEvent } from "@teacher-helper/domain";

export type AdminBillingSource = {
  listPayments(): Promise<readonly PaymentEvent[]>;
};
