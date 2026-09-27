import { AlertSummary } from "../../../components/admin/alert-summary";
import { PortfolioSummary } from "../../../components/admin/portfolio-summary";
import { PageHeader } from "../../../components/navigation/page-header";
import { getDatabasePool } from "../../../lib/database";
import { requirePlatformOwner, getCurrentIdentity } from "../../../lib/auth/dal";
import { createPostgresPlatformAdminRepository } from "@teacher-helper/integrations/src/admin/postgres-dashboard";
import { buildAdminDashboardData } from "../../../features/admin/dashboard";

export default async function PlatformAdminPage() {
  requirePlatformOwner(await getCurrentIdentity());
  let dashboard;
  try {
    const client = await getDatabasePool().connect();
    try {
      const repository = createPostgresPlatformAdminRepository(client);
      dashboard = buildAdminDashboardData(
        await repository.getDashboardSummary(),
        await repository.listCentres(),
        await repository.listAlerts(),
      );
    } finally {
      client.release();
    }
  } catch {
    return (
      <main className="admin-page">
        <PageHeader
          eyebrow="Platform administration"
          title="Portfolio unavailable"
          description="The platform health data could not be loaded. Try again when the database is available."
        />
      </main>
    );
  }

  return (
    <main className="admin-page">
      <PageHeader
        eyebrow="Platform administration"
        title="Portfolio overview"
        description="A business-safe view of centre health, subscription signals, and action items."
      />
      <PortfolioSummary summary={dashboard.summary} />
      <section
        className="admin-section admin-section--split"
        aria-labelledby="subscription-health-title"
      >
        <div>
          <p className="admin-section__eyebrow">Commercial health</p>
          <h2 id="subscription-health-title">Subscription health</h2>
          <p className="admin-section__copy">
            {dashboard.centres.length} centres are in view. Review the current subscription and alert
            signals below.
          </p>
        </div>
        <a className="admin-section__action" href="/admin/billing">
          Review billing
        </a>
      </section>
      {dashboard.centres.length === 0 ? (
        <section className="admin-section" aria-labelledby="portfolio-empty-title">
          <h2 id="portfolio-empty-title">No centres yet</h2>
          <p className="admin-section__copy">The portfolio has no active or trial centres to review.</p>
        </section>
      ) : null}
      <AlertSummary alerts={dashboard.alerts} />
    </main>
  );
}
