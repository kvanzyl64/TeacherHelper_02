export type BillingPlan = {
  planName: string;
  status: "trial" | "active" | "past_due" | "cancelled" | "at_risk";
  renewalDate?: Date;
  monthlyValue: string;
  currency: "ZAR";
  seatCount: number;
};

export type PaymentEvent = {
  paymentId: string;
  centreId: string;
  amount: string;
  currency: "ZAR";
  status: "paid" | "failed" | "pending" | "overdue" | "disputed";
  occurredAt: Date;
  followUpRequired: boolean;
};
