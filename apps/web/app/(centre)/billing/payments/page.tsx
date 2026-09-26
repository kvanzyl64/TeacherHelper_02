import { PageHeader } from "../../../../components/navigation/page-header";
import { PageState } from "../../../../components/navigation/page-state";

export default function PaymentsPage() {
  return (
    <main>
      <PageHeader title="Payments" description="Track payments recorded for this centre." />
      <PageState kind="empty" description="No payments have been recorded yet." action={{ href: "/billing/invoices", label: "Review invoices" }} />
    </main>
  );
}