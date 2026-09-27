import { PageHeader } from "../../../../components/navigation/page-header";
import { PageState } from "../../../../components/navigation/page-state";
import { createPostgresCentreWorkflowRepository } from "@teacher-helper/integrations";
import { getCurrentCentreMembership, getCurrentIdentity } from "../../../../lib/auth/dal";
import { getDatabasePool } from "../../../../lib/database";
import { withTenantTransaction } from "../../../../lib/database/tenant-transaction";

export default async function ReceiptsPage() {
  const identity = await getCurrentIdentity();
  const membership = await getCurrentCentreMembership(identity);
  const payments = await withTenantTransaction({ pool: getDatabasePool(), centreId: membership.centreId, userId: membership.userId, run: (client) => createPostgresCentreWorkflowRepository(client).listPayments(membership.centreId) });
  return (
    <main>
      <PageHeader title="Receipts" description="Find receipts linked to centre payments." />
      {payments.length ? <ul>{payments.map((payment) => <li key={payment.id}>Receipt for R{payment.amount} · {payment.reference}</li>)}</ul> : <PageState kind="empty" description="Receipts will appear after a payment is recorded." action={{ href: "/billing/payments", label: "Review payments" }} />}
    </main>
  );
}