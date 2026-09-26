import { PeopleField } from "../../../components/people/people-form";
import { PageHeader } from "../../../components/navigation/page-header";

export default function PeoplePage() {
  return (
    <main>
      <PageHeader title="People" description="Manage students, guardians, consent, and tutor assignments." />
      <p>
        <a href="/people/students">Students</a> · <a href="/people/guardians">Guardians</a>
      </p>
      <a href="/people/students/new">Add student</a>
      <PeopleField id="search" label="Search people" />
    </main>
  );
}