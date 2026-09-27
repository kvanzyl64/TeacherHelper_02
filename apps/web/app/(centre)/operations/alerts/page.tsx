import { PageHeader } from "../../../../components/navigation/page-header";
import { PageState } from "../../../../components/navigation/page-state";
import { createPostgresCentreWorkflowRepository } from "@teacher-helper/integrations";
import { getCurrentCentreMembership, getCurrentIdentity } from "../../../../lib/auth/dal";
import { getDatabasePool } from "../../../../lib/database";
import { withTenantTransaction } from "../../../../lib/database/tenant-transaction";

export default async function OperationsAlertsPage() {
  const identity = await getCurrentIdentity();
  const membership = await getCurrentCentreMembership(identity);
  const summary = await withTenantTransaction({ pool: getDatabasePool(), centreId: membership.centreId, userId: membership.userId, run: (client) => createPostgresCentreWorkflowRepository(client).getOperationsSummary(membership.centreId) });
  return (
    <main className="operations-alerts">
      <PageHeader title="Operations alerts" description="Backup, recovery, and retention alerts for this centre." />
      {summary.failedNotifications || summary.scheduledRetentionJobs ? <ul><li>Failed notifications: {summary.failedNotifications}</li><li>Scheduled retention jobs: {summary.scheduledRetentionJobs}</li></ul> : <PageState kind="empty" description="There are no active operational alerts for this centre right now." action={{ href: "/dashboard", label: "Return to dashboard" }} />}
    </main>
  );
}
