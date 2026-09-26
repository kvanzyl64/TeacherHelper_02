import { PageHeader } from "../../../../components/navigation/page-header";
import { PageState } from "../../../../components/navigation/page-state";

export default function OperationsAlertsPage() {
  return (
    <main className="operations-alerts">
      <PageHeader title="Operations alerts" description="Backup, recovery, and retention alerts for this centre." />
      <PageState kind="empty" description="There are no active operational alerts for this centre right now." action={{ href: "/dashboard", label: "Return to dashboard" }} />
    </main>
  );
}
