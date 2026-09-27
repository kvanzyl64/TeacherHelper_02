import { randomUUID } from "node:crypto";
import { notFound } from "next/navigation";
import { PageHeader } from "../../../../components/navigation/page-header";
import { getCurrentIdentity, requirePlatformOwner } from "../../../../lib/auth/dal";
import { getDatabasePool } from "../../../../lib/database";
import { createPostgresPlatformAdminRepository } from "@teacher-helper/integrations/src/admin/postgres-dashboard";

export default async function CentreDetailPage({
  params,
}: {
  params: Promise<{ centreId: string }>;
}) {
  const { centreId } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(centreId)) notFound();

  const owner = requirePlatformOwner(await getCurrentIdentity());
  let centre;
  try {
    const client = await getDatabasePool().connect();
    try {
      centre = await createPostgresPlatformAdminRepository(client).getCentre(
        centreId,
        owner.id,
        randomUUID(),
      );
    } finally {
      client.release();
    }
  } catch {
    return (
      <main className="admin-page">
        <PageHeader
          eyebrow="Platform administration / centre"
          title="Centre unavailable"
          description="The centre overview could not be loaded. Try again when the database is available."
        />
      </main>
    );
  }

  if (!centre) notFound();
  const latestAlerts = centre.openAlerts;

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
