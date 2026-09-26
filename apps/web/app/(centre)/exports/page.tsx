import { PageHeader } from "../../../components/navigation/page-header";
import { PageState } from "../../../components/navigation/page-state";

export default function ExportsPage() {
  return (
    <main className="exports-page">
      <PageHeader title="Exports" description="Recent tenant exports and retention status for this centre." />
      <PageState kind="empty" description="No export requests have been created yet. When a report is ready, it will appear here with its valid window." action={{ href: "/dashboard", label: "Return to dashboard" }} />
    </main>
  );
}
