import { PageHeader } from "../../../../components/navigation/page-header";
import { buildAdminAlertsData } from "../../../../features/admin/alerts";
import { getCurrentIdentity, requirePlatformOwner } from "../../../../lib/auth/dal";
import { getDatabasePool } from "../../../../lib/database";
import { createPostgresPlatformAlertRepository } from "@teacher-helper/integrations/src/admin/postgres-alerts";
import { createPostgresSupportCaseRepository } from "@teacher-helper/integrations/src/admin/postgres-support-cases";
import { updatePlatformAlert, updatePlatformSupportCase } from "./actions";

export default async function AdminAlertsPage() {
  requirePlatformOwner(await getCurrentIdentity());
  let alerts;
  try {
    const client = await getDatabasePool().connect();
    try {
      const alertRepository = createPostgresPlatformAlertRepository(client);
      const supportCaseRepository = createPostgresSupportCaseRepository(client);
      alerts = buildAdminAlertsData(
        await alertRepository.listAlerts(),
        await supportCaseRepository.listCases(),
      );
    } finally {
      client.release();
    }
  } catch {
    return (
      <main className="admin-page">
        <PageHeader
          eyebrow="Platform administration / alerts"
          title="Alerts unavailable"
          description="The alert queue could not be loaded. Try again when the database is available."
        />
      </main>
    );
  }

  return (
    <main className="admin-page">
      <PageHeader
        eyebrow="Platform administration / alerts"
        title="Operational alerts"
        description="Track service issues, payment risks, and support follow-up without exposing unrelated tenant details."
      />

      <section className="admin-section" aria-labelledby="alert-overview-title">
        <div className="admin-section__heading">
          <div>
            <p className="admin-section__eyebrow">Current workload</p>
            <h2 id="alert-overview-title">Open alert summary</h2>
          </div>
        </div>

        <div className="admin-summary" aria-label="Alert summary">
          <article className="admin-summary__card">
            <p>Open alerts</p>
            <strong>{alerts.openCount}</strong>
            <span>needs review</span>
          </article>
          <article className="admin-summary__card">
            <p>Critical</p>
            <strong>{alerts.severitySummary.critical ?? 0}</strong>
            <span>highest priority</span>
          </article>
          <article className="admin-summary__card">
            <p>Warnings</p>
            <strong>{alerts.severitySummary.warning ?? 0}</strong>
            <span>monitor closely</span>
          </article>
        </div>
      </section>

      {alerts.alerts.length === 0 ? (
        <section className="admin-section" aria-labelledby="alerts-empty-title">
          <h2 id="alerts-empty-title">No operational alerts</h2>
          <p className="admin-section__copy">The platform has no unresolved operational escalations.</p>
        </section>
      ) : null}

      <section className="admin-section" aria-labelledby="alerts-table-title">
        <div className="admin-section__heading">
          <div>
            <p className="admin-section__eyebrow">Escalations</p>
            <h2 id="alerts-table-title">Alert queue</h2>
          </div>
        </div>

        <ul className="admin-alert-list">
          {alerts.alerts.map((alert: (typeof alerts.alerts)[number]) => (
            <li className="admin-alert-list__item" key={alert.alertId}>
              <span className={`admin-status admin-status--${alert.severity}`}>{alert.severity}</span>
              <div>
                <strong>{alert.summary}</strong>
                <span>
                  {alert.centreId} · {alert.type} · {alert.status}
                </span>
              </div>
              {alert.status === "open" ? (
                <form action={updatePlatformAlert}>
                  <input type="hidden" name="alertId" value={alert.alertId} />
                  <input type="hidden" name="status" value="acknowledged" />
                  <button type="submit">Acknowledge</button>
                </form>
              ) : alert.status === "acknowledged" ? (
                <form action={updatePlatformAlert}>
                  <input type="hidden" name="alertId" value={alert.alertId} />
                  <input type="hidden" name="status" value="resolved" />
                  <button type="submit">Resolve</button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="admin-section" aria-labelledby="support-cases-title">
        <div className="admin-section__heading">
          <div>
            <p className="admin-section__eyebrow">Support follow-up</p>
            <h2 id="support-cases-title">Support cases</h2>
          </div>
        </div>

        <ul className="admin-alert-list">
          {alerts.supportCases.map((supportCase: (typeof alerts.supportCases)[number]) => (
            <li className="admin-alert-list__item" key={supportCase.caseId}>
              <span className="admin-status admin-status--info">{supportCase.status}</span>
              <div>
                <strong>{supportCase.summary}</strong>
                <span>
                  {supportCase.centreId} · {supportCase.issueType} · {supportCase.owner}
                </span>
              </div>
              {supportCase.status === "open" ? (
                <form action={updatePlatformSupportCase}>
                  <input type="hidden" name="caseId" value={supportCase.caseId} />
                  <input type="hidden" name="status" value="in_review" />
                  <button type="submit">Review</button>
                </form>
              ) : supportCase.status === "in_review" ? (
                <form action={updatePlatformSupportCase}>
                  <input type="hidden" name="caseId" value={supportCase.caseId} />
                  <input type="hidden" name="status" value="resolved" />
                  <button type="submit">Resolve</button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
