import type { AdminBillingRow, AdminBillingSummary } from "@teacher-helper/domain";
import { createBillingSummary, getBillingFollowUpRows } from "@teacher-helper/domain";

export const demoAdminBillingRows: readonly AdminBillingRow[] = [
  {
    centreId: "northside",
    centreName: "Northside Centre",
    planName: "Growth",
    status: "active",
    monthlyValue: "1200.00",
    currency: "ZAR",
    lastPaymentAt: new Date("2026-09-01"),
    overdueAmount: "0.00",
    followUpRequired: false,
    paymentStatus: "paid",
  },
  {
    centreId: "trial-centre",
    centreName: "Trial Centre",
    planName: "Starter",
    status: "trial",
    monthlyValue: "650.00",
    currency: "ZAR",
    overdueAmount: "0.00",
    followUpRequired: false,
    paymentStatus: "pending",
  },
  {
    centreId: "riverside",
    centreName: "Riverside Tutors",
    planName: "Growth",
    status: "past_due",
    monthlyValue: "1200.00",
    currency: "ZAR",
    lastPaymentAt: new Date("2026-08-01"),
    overdueAmount: "1200.00",
    followUpRequired: true,
    paymentStatus: "overdue",
  },
];

export function buildAdminBillingData(rows: readonly AdminBillingRow[]): {
  summary: AdminBillingSummary;
  followUpRows: readonly AdminBillingRow[];
} {
  return { summary: createBillingSummary({ rows }), followUpRows: getBillingFollowUpRows(rows) };
}
