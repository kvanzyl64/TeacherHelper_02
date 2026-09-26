import type { CentrePortfolioRecord } from "./portfolio";
import type { PaymentEvent } from "./billing";
import type { OperationalAlert } from "./alerts";

export function countActiveCentres(centres: readonly CentrePortfolioRecord[]): number {
  return centres.filter((centre) => centre.status === "active").length;
}

export function countTrialCentres(centres: readonly CentrePortfolioRecord[]): number {
  return centres.filter((centre) => centre.subscriptionStatus === "trial").length;
}

export function countPastDueCentres(centres: readonly CentrePortfolioRecord[]): number {
  return centres.filter((centre) => centre.subscriptionStatus === "past_due").length;
}

export function countOpenAlerts(alerts: readonly OperationalAlert[]): number {
  return alerts.filter((alert) => alert.status !== "resolved").length;
}

export function countFollowUpPayments(payments: readonly PaymentEvent[]): number {
  return payments.filter((payment) => payment.followUpRequired).length;
}
