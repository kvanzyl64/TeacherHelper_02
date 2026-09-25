import { PeopleField } from "../../../components/people/people-form";

export default function PeoplePage() {
  return (
    <main>
      <h1>People</h1>
      <p>Manage students, guardians, consent, and tutor assignments.</p>
      <p>
        <a href="/people/students">Students</a> · <a href="/people/guardians">Guardians</a>
      </p>
      <a href="/people/students/new">Add student</a>
      <PeopleField id="search" label="Search people" />
    </main>
  );
}