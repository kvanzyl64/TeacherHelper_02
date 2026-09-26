import { PageHeader } from "../../../../components/navigation/page-header";
import { PageState } from "../../../../components/navigation/page-state";

export default function ReceiptsPage() {
  return (
    <main>
      <PageHeader title="Receipts" description="Find receipts linked to centre payments." />
      <PageState kind="empty" description="Receipts will appear after a payment is recorded." action={{ href: "/billing/payments", label: "Review payments" }} />
    </main>
  );
}