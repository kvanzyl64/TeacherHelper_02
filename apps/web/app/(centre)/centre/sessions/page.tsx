import { PageHeader } from "../../../../components/navigation/page-header";
import { PageState } from "../../../../components/navigation/page-state";
import { createPostgresCentreWorkflowRepository } from "@teacher-helper/integrations";
import { getCurrentCentreMembership, getCurrentIdentity } from "../../../../lib/auth/dal";
import { getDatabasePool } from "../../../../lib/database";
import { withTenantTransaction } from "../../../../lib/database/tenant-transaction";

export default async function CentreSessionsPage() {
  const identity = await getCurrentIdentity();
  const membership = await getCurrentCentreMembership(identity);
  const sessions = await withTenantTransaction({ pool: getDatabasePool(), centreId: membership.centreId, userId: membership.userId, run: (client) => createPostgresCentreWorkflowRepository(client).listSessions(membership) });
  return (
    <main>
      <PageHeader title="Centre sessions" description="Review session activity across your centre." />
      {sessions.length ? <ul>{sessions.map((session) => <li key={session.id}>{session.subject} · {session.reviewStatus}</li>)}</ul> : <PageState kind="empty" description="No centre sessions are ready to review yet." action={{ href: "/people", label: "Review people" }} />}
    </main>
  );
}