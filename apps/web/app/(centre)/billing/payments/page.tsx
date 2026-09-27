import { PageHeader } from "../../../../components/navigation/page-header";
import { PageState } from "../../../../components/navigation/page-state";
import { createPostgresCentreWorkflowRepository } from "@teacher-helper/integrations";
import { getCurrentCentreMembership, getCurrentIdentity } from "../../../../lib/auth/dal";
import { getDatabasePool } from "../../../../lib/database";
import { withTenantTransaction } from "../../../../lib/database/tenant-transaction";

export default async function PaymentsPage() {
  const identity = await getCurrentIdentity();
  const membership = await getCurrentCentreMembership(identity);
  const payments = await withTenantTransaction({ pool: getDatabasePool(), centreId: membership.centreId, userId: membership.userId, run: (client) => createPostgresCentreWorkflowRepository(client).listPayments(membership.centreId) });
  return (
    <main>
      <PageHeader title="Payments" description="Track payments recorded for this centre." />
      {payments.length ? <ul>{payments.map((payment) => <li key={payment.id}>R{payment.amount} · {payment.method} · {payment.reference}</li>)}</ul> : <PageState kind="empty" description="No payments have been recorded yet." action={{ href: "/billing/invoices", label: "Review invoices" }} />}
    </main>
  );
}