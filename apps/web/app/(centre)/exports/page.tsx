import { PageHeader } from "../../../components/navigation/page-header";
import { PageState } from "../../../components/navigation/page-state";
import { createPostgresCentreWorkflowRepository } from "@teacher-helper/integrations";
import { getCurrentCentreMembership, getCurrentIdentity } from "../../../lib/auth/dal";
import { getDatabasePool } from "../../../lib/database";
import { withTenantTransaction } from "../../../lib/database/tenant-transaction";

export default async function ExportsPage() {
  const identity = await getCurrentIdentity();
  const membership = await getCurrentCentreMembership(identity);
  if (membership.role !== "owner" && membership.role !== "admin") {
    return (
      <main className="exports-page">
        <PageHeader title="Exports" description="Recent tenant exports and retention status for this centre." />
        <PageState kind="denied" description="Exports are available to centre owners and administrators only." action={{ href: "/dashboard", label: "Return to dashboard" }} />
      </main>
    );
  }
  const exports = await withTenantTransaction({ pool: getDatabasePool(), centreId: membership.centreId, userId: membership.userId, run: (client) => createPostgresCentreWorkflowRepository(client).listExports(membership.centreId) });
  return (
    <main className="exports-page">
      <PageHeader title="Exports" description="Recent tenant exports and retention status for this centre." />
      {exports.length ? <ul>{exports.map((item) => <li key={item.id}>{item.scope} · {item.status}</li>)}</ul> : <PageState kind="empty" description="No export requests have been created yet. When a report is ready, it will appear here with its valid window." action={{ href: "/dashboard", label: "Return to dashboard" }} />}
    </main>
  );
}
