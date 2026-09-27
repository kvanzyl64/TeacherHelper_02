import { createPostgresPeopleRepository } from "@teacher-helper/integrations";
import { getCurrentCentreMembership, getCurrentIdentity } from "../../../../lib/auth/dal";
import { getDatabasePool } from "../../../../lib/database";
import { withTenantTransaction } from "../../../../lib/database/tenant-transaction";

export default async function StudentsPage() {
  const identity = await getCurrentIdentity();
  const membership = await getCurrentCentreMembership(identity);
  const students = await withTenantTransaction({ pool: getDatabasePool(), centreId: membership.centreId, userId: membership.userId, run: (client) => createPostgresPeopleRepository(client).listStudents(membership.centreId) });
  return (
    <main>
      <h1>Students</h1>
      <a href="/people/students/new">Add student</a>
      {students.length ? <ul>{students.map((student) => <li key={student.id}>{student.name} ({student.reference})</li>)}</ul> : <p>No students have been added yet.</p>}
    </main>
  );
}