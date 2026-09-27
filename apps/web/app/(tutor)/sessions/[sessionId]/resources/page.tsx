import { PageHeader } from "../../../../../components/navigation/page-header";
import { PageState } from "../../../../../components/navigation/page-state";
import { createPostgresCentreWorkflowRepository } from "@teacher-helper/integrations";
import { getCurrentCentreMembership, getCurrentIdentity } from "../../../../../lib/auth/dal";
import { getDatabasePool } from "../../../../../lib/database";
import { withTenantTransaction } from "../../../../../lib/database/tenant-transaction";

export default async function SessionResourcesPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  let resources: Awaited<ReturnType<ReturnType<typeof createPostgresCentreWorkflowRepository>["listSessionResources"]>> = [];
  let unavailable = false;
  try {
    const identity = await getCurrentIdentity();
    const membership = await getCurrentCentreMembership(identity);
    resources = await withTenantTransaction({
      pool: getDatabasePool(),
      centreId: membership.centreId,
      userId: membership.userId,
      run: (client) => createPostgresCentreWorkflowRepository(client).listSessionResources({ centreId: membership.centreId, sessionId, userId: membership.userId, role: membership.role }),
    });
  } catch {
    unavailable = true;
  }
  return (
    <main className="guardian-page">
      <PageHeader title="Session resources" description="Resources are limited to the assigned tutor and centre staff for this session." />
      {unavailable ? (
        <PageState kind="failed" description="Session resources are temporarily unavailable. Reconnect and try again." action={{ href: "/sessions", label: "Back to sessions" }} />
      ) : resources.length ? (
        <ul>
          {resources.map((resource) => (
            <li key={resource.id}>
              {resource.name} · {resource.visibility}
            </li>
          ))}
        </ul>
      ) : (
        <PageState kind="empty" description="No resources are available for this session, or it is not assigned to you." action={{ href: "/sessions", label: "Back to sessions" }} />
      )}
    </main>
  );
}
