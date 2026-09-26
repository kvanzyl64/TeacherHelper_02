import { PageHeader } from "../../../components/navigation/page-header";
import { PageState } from "../../../components/navigation/page-state";

export default function CentreDashboardPage() {
  return (
    <main>
      <PageHeader title="Centre dashboard" description="A clear view of your centre activity and next actions." />
      <PageState kind="empty" description="There is no centre activity to display yet. Add students, sessions, and team setup to populate this dashboard." action={{ href: "/people", label: "Review people" }} />
    </main>
  );
}