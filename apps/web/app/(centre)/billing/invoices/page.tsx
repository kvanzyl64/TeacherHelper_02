import { PageHeader } from "../../../../components/navigation/page-header";
import { PageState } from "../../../../components/navigation/page-state";

export default function InvoicesPage() {
  return (
    <main>
      <PageHeader title="Invoices" description="Review centre-scoped invoices and their current status." />
      <PageState kind="empty" description="No invoices have been issued yet." action={{ href: "/people", label: "Review people" }} />
    </main>
  );
}