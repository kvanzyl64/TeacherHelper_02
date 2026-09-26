import { BillingOverview } from "../../../../components/admin/billing-overview";
import { PageHeader } from "../../../../components/navigation/page-header";
import { buildAdminBillingData, demoAdminBillingRows } from "../../../../features/admin/billing";

export default function AdminBillingPage() {
  const billing = buildAdminBillingData(demoAdminBillingRows);

  return (
    <main className="admin-page">
      <PageHeader
        eyebrow="Platform administration / finance"
        title="Billing overview"
        description="Review subscription health, payment risk, and centre follow-up without opening protected tenant records."
      />
      <BillingOverview summary={billing.summary} rows={demoAdminBillingRows} />
    </main>
  );
}
