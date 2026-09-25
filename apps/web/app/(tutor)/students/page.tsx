import { canViewStudent } from "../../../../../packages/domain/src/people/visibility-policy";

export default function TutorStudentsPage() {
  canViewStudent;
  return (
    <main>
      <h1>My students</h1>
      <p>Only students with an active tutor assignment are shown.</p>
    </main>
  );
}