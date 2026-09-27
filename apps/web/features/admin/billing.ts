import type { AdminBillingRow, AdminBillingSummary } from "@teacher-helper/domain";
import { createBillingSummary, getBillingFollowUpRows } from "@teacher-helper/domain";

export function buildAdminBillingData(
  rows: readonly AdminBillingRow[],
  summary = createBillingSummary({ rows }),
): {
  summary: AdminBillingSummary;
  rows: readonly AdminBillingRow[];
  followUpRows: readonly AdminBillingRow[];
} {
  return { summary, rows, followUpRows: getBillingFollowUpRows(rows) };
}
