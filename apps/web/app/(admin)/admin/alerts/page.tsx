import { PageHeader } from "../../../../components/navigation/page-header";
import { buildAdminAlertsData, demoAdminSupportCases } from "../../../../features/admin/alerts";
import { demoAdminAlerts } from "../../../../features/admin/dashboard";

export default function AdminAlertsPage() {
  const alerts = buildAdminAlertsData(demoAdminAlerts, demoAdminSupportCases);

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
              <a href={`/admin/centres/${alert.centreId}`}>Review centre</a>
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
              <a href={`/admin/centres/${supportCase.centreId}`}>Trace centre</a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
