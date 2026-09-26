export type AdminBillingRow = {
  centreId: string;
  centreName: string;
  planName: string;
  status: "trial" | "active" | "past_due" | "cancelled" | "at_risk";
  monthlyValue: string;
  currency: "ZAR";
  lastPaymentAt?: Date;
  overdueAmount: string;
  followUpRequired: boolean;
  paymentStatus?: "paid" | "failed" | "pending" | "overdue" | "disputed";
};

export type AdminBillingSummary = {
  overdueCentres: number;
  failedPayments: number;
  followUpCentres: number;
  monthlyRecurringRevenue: string;
  planAdoption: Readonly<Record<string, number>>;
};

function amount(value: string, field: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`The ${field} amount is invalid`);
  }
  return parsed;
}

export function createBillingSummary(input: {
  rows: readonly AdminBillingRow[];
}): AdminBillingSummary {
  const planAdoption: Record<string, number> = {};
  let monthlyRecurringRevenue = 0;

  for (const row of input.rows) {
    amount(row.monthlyValue, "monthly value");
    amount(row.overdueAmount, "overdue");
    monthlyRecurringRevenue += Number(row.monthlyValue);
    planAdoption[row.planName] = (planAdoption[row.planName] ?? 0) + 1;
  }

  return {
    overdueCentres: input.rows.filter(
      (row) => row.status === "past_due" || Number(row.overdueAmount) > 0,
    ).length,
    failedPayments: input.rows.filter((row) => row.paymentStatus === "failed").length,
    followUpCentres: input.rows.filter((row) => row.followUpRequired).length,
    monthlyRecurringRevenue: monthlyRecurringRevenue.toFixed(2),
    planAdoption,
  };
}

export function getBillingFollowUpRows(
  rows: readonly AdminBillingRow[],
): readonly AdminBillingRow[] {
  return rows.filter(
    (row) => row.followUpRequired || row.status === "past_due" || row.paymentStatus === "failed",
  );
}
