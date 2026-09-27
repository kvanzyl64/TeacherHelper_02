import { PageHeader } from "../../../components/navigation/page-header";
import { createPostgresCentreWorkflowRepository } from "@teacher-helper/integrations";
import { getCurrentCentreMembership, getCurrentIdentity } from "../../../lib/auth/dal";
import { getDatabasePool } from "../../../lib/database";
import { withTenantTransaction } from "../../../lib/database/tenant-transaction";

export default async function TutorSessionsPage() {
  const identity = await getCurrentIdentity();
  const membership = await getCurrentCentreMembership(identity);
  const sessions = await withTenantTransaction({ pool: getDatabasePool(), centreId: membership.centreId, userId: membership.userId, run: (client) => createPostgresCentreWorkflowRepository(client).listSessions(membership) });
  return (
    <main className="guardian-page">
      <PageHeader title="Tutor sessions" description="Review sessions assigned to you and open their resources." />
      <ul>
        {sessions.map((session) => (
          <li key={session.id}>
            {session.subject} — {session.reviewStatus}
          </li>
        ))}
      </ul>
    </main>
  );
}