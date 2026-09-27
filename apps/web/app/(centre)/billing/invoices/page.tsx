import { PageHeader } from "../../../../components/navigation/page-header";
import { PageState } from "../../../../components/navigation/page-state";
import { createPostgresCentreWorkflowRepository } from "@teacher-helper/integrations";
import { getCurrentCentreMembership, getCurrentIdentity } from "../../../../lib/auth/dal";
import { getDatabasePool } from "../../../../lib/database";
import { withTenantTransaction } from "../../../../lib/database/tenant-transaction";

export default async function InvoicesPage() {
  const identity = await getCurrentIdentity();
  const membership = await getCurrentCentreMembership(identity);
  const invoices = await withTenantTransaction({ pool: getDatabasePool(), centreId: membership.centreId, userId: membership.userId, run: (client) => createPostgresCentreWorkflowRepository(client).listInvoices(membership.centreId) });
  return (
    <main>
      <PageHeader title="Invoices" description="Review centre-scoped invoices and their current status." />
      {invoices.length ? <ul>{invoices.map((invoice) => <li key={invoice.id}>{invoice.familyReference} · R{invoice.total} · {invoice.status}</li>)}</ul> : <PageState kind="empty" description="No invoices have been issued yet." action={{ href: "/people", label: "Review people" }} />}
    </main>
  );
}