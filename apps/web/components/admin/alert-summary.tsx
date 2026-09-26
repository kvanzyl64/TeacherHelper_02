import type { OperationalAlert } from "@teacher-helper/domain";

export function AlertSummary({ alerts }: { alerts: readonly OperationalAlert[] }) {
  const openAlerts = alerts.filter((alert) => alert.status !== "resolved");

  return (
    <section className="admin-section" aria-labelledby="alert-summary-title">
      <div className="admin-section__heading">
        <div>
          <p className="admin-section__eyebrow">Needs attention</p>
          <h2 id="alert-summary-title">Open alerts</h2>
        </div>
        <a href="/admin/alerts">View all alerts</a>
      </div>
      <ul className="admin-alert-list">
        {openAlerts.map((alert) => (
          <li className="admin-alert-list__item" key={alert.alertId}>
            <span className={`admin-status admin-status--${alert.severity}`}>{alert.severity}</span>
            <div>
              <strong>{alert.summary}</strong>
              <span>{alert.centreId}</span>
            </div>
            <a href={`/admin/centres/${alert.centreId}`}>Review</a>
          </li>
        ))}
      </ul>
    </section>
  );
}
