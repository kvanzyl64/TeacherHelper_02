export type CentrePortfolioStatus = "trial" | "active" | "paused" | "suspended" | "flagged";
export type SubscriptionStatus = "active" | "past_due" | "trial" | "cancelled" | "at_risk";

export type CentrePortfolioRecord = {
  centreId: string;
  name: string;
  status: CentrePortfolioStatus;
  subscriptionStatus: SubscriptionStatus;
  ownerContact: string;
  lastPaymentAt?: Date;
  supportFlag: boolean;
};
