import { PageHeader } from "../../../../components/navigation/page-header";
import { PageState } from "../../../../components/navigation/page-state";

export default function CentreSessionsPage() {
  return (
    <main>
      <PageHeader title="Centre sessions" description="Review session activity across your centre." />
      <PageState kind="empty" description="No centre sessions are ready to review yet." action={{ href: "/people", label: "Review people" }} />
    </main>
  );
}