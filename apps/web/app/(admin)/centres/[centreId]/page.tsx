import { notFound } from "next/navigation";
import { PageHeader } from "../../../../components/navigation/page-header";
import { demoAdminAlerts, demoAdminCentres } from "../../../../features/admin/dashboard";

export default async function CentreDetailPage({
  params,
}: {
  params: Promise<{ centreId: string }>;
}) {
  const { centreId } = await params;
  const centre = demoAdminCentres.find((entry: (typeof demoAdminCentres)[number]) => entry.centreId === centreId);

  if (!centre) {
    notFound();
  }

  const latestAlerts = demoAdminAlerts.filter((alert: (typeof demoAdminAlerts)[number]) => alert.centreId === centreId);

  return (
    <main className="admin-page">
      <PageHeader
        eyebrow="Platform administration / centre"
        title={centre.name}
        description="Business-safe centre overview for payment risk and operational support follow-up."
      />

      <section className="admin-summary" aria-label="Centre status summary">
        <article className="admin-summary__card">
          <p>Status</p>
          <strong>{centre.status}</strong>
          <span>tenant posture</span>
        </article>
        <article className="admin-summary__card">
          <p>Subscription</p>
          <strong>{centre.subscriptionStatus}</strong>
          <span>commercial health</span>
        </article>
        <article className="admin-summary__card">
          <p>Owner contact</p>
          <strong>{centre.ownerContact}</strong>
          <span>safe business contact</span>
        </article>
      </section>

      <section className="admin-section" aria-labelledby="centre-alerts-title">
        <div className="admin-section__heading">
          <div>
            <p className="admin-section__eyebrow">Operational context</p>
            <h2 id="centre-alerts-title">Open alerts</h2>
          </div>
        </div>

        <ul className="admin-alert-list">
          {latestAlerts.length > 0 ? (
            latestAlerts.map((alert: (typeof latestAlerts)[number]) => (
              <li className="admin-alert-list__item" key={alert.alertId}>
                <span className={`admin-status admin-status--${alert.severity}`}>{alert.severity}</span>
                <div>
                  <strong>{alert.summary}</strong>
                  <span>
                    {alert.type} · {alert.status}
                  </span>
                </div>
              </li>
            ))
          ) : (
            <li className="admin-alert-list__item">
              <div>
                <strong>No open alerts</strong>
                <span>This centre is clear of platform escalations.</span>
              </div>
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}
