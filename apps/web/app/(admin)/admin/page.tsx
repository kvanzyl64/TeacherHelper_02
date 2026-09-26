import { AlertSummary } from "../../../components/admin/alert-summary";
import { PortfolioSummary } from "../../../components/admin/portfolio-summary";
import { PageHeader } from "../../../components/navigation/page-header";
import {
  buildAdminDashboardData,
  demoAdminAlerts,
  demoAdminCentres,
} from "../../../features/admin/dashboard";

export default function PlatformAdminPage() {
  const dashboard = buildAdminDashboardData(demoAdminCentres, demoAdminAlerts);

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
            Three centres are in view. One requires payment follow-up, while one is still evaluating
            the platform.
          </p>
        </div>
        <a className="admin-section__action" href="/admin/billing">
          Review billing
        </a>
      </section>
      <AlertSummary alerts={demoAdminAlerts} />
    </main>
  );
}
