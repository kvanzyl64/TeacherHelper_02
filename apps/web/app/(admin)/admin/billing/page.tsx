import { BillingOverview } from "../../../../components/admin/billing-overview";
import { PageHeader } from "../../../../components/navigation/page-header";
import { buildAdminBillingData } from "../../../../features/admin/billing";
import { getCurrentIdentity, requirePlatformOwner } from "../../../../lib/auth/dal";
import { getDatabasePool } from "../../../../lib/database";
import { createPostgresBillingRepository } from "@teacher-helper/integrations/src/admin/postgres-billing";
import { updateSaasPayment } from "./actions";

export default async function AdminBillingPage() {
  requirePlatformOwner(await getCurrentIdentity(), "admin:billing:read");
  let billing;
  try {
    const client = await getDatabasePool().connect();
    try {
      const repository = createPostgresBillingRepository(client);
      billing = buildAdminBillingData(await repository.listRows(), await repository.getSummary());
    } finally {
      client.release();
    }
  } catch {
    return (
      <main className="admin-page">
        <PageHeader
          eyebrow="Platform administration / finance"
          title="Billing unavailable"
          description="SaaS subscription data could not be loaded. Try again when the database is available."
        />
      </main>
    );
  }

  return (
    <main className="admin-page">
      <PageHeader
        eyebrow="Platform administration / finance"
        title="Billing overview"
        description="Review subscription health, payment risk, and centre follow-up without opening protected tenant records."
      />
      {billing.rows.length === 0 ? (
        <section className="admin-section" aria-labelledby="billing-empty-title">
          <h2 id="billing-empty-title">No SaaS subscriptions yet</h2>
          <p className="admin-section__copy">Subscription revenue will appear after a centre starts a plan.</p>
        </section>
      ) : null}
      <BillingOverview summary={billing.summary} rows={billing.rows} paymentAction={updateSaasPayment} />
    </main>
  );
}
