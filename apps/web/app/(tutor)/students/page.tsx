import { PageHeader } from "../../../components/navigation/page-header";
import { PageState } from "../../../components/navigation/page-state";
import { createPostgresCentreWorkflowRepository } from "@teacher-helper/integrations";
import { getCurrentCentreMembership, getCurrentIdentity } from "../../../lib/auth/dal";
import { getDatabasePool } from "../../../lib/database";
import { withTenantTransaction } from "../../../lib/database/tenant-transaction";

export default async function TutorStudentsPage() {
  let students: Awaited<ReturnType<ReturnType<typeof createPostgresCentreWorkflowRepository>["listAssignedStudents"]>> = [];
  let unavailable = false;
  try {
    const identity = await getCurrentIdentity();
    const membership = await getCurrentCentreMembership(identity);
    students = await withTenantTransaction({
      pool: getDatabasePool(),
      centreId: membership.centreId,
      userId: membership.userId,
      run: (client) => createPostgresCentreWorkflowRepository(client).listAssignedStudents({ centreId: membership.centreId, userId: membership.userId }),
    });
  } catch {
    unavailable = true;
  }
  return (
    <main>
      <PageHeader title="My students" description="Only students with an active tutor assignment are shown." />
      {unavailable ? (
        <PageState kind="failed" description="Assigned students are temporarily unavailable. Reconnect and try again." action={{ href: "/sessions", label: "Review sessions" }} />
      ) : students.length ? (
        <ul>
          {students.map((student) => (
            <li key={student.id}>
              {student.name} ({student.reference}) · {student.enrolmentStatus}
            </li>
          ))}
        </ul>
      ) : (
        <PageState kind="empty" description="You have no active student assignments yet." action={{ href: "/sessions", label: "Review sessions" }} />
      )}
    </main>
  );
}