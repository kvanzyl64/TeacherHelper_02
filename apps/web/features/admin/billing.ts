import type { PaymentEvent } from "@teacher-helper/domain";

export function getAdminPaymentFollowUps(
  payments: readonly PaymentEvent[],
): readonly PaymentEvent[] {
  return payments.filter((payment) => payment.followUpRequired);
}
