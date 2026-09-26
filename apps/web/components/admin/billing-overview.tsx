import type { AdminBillingRow, AdminBillingSummary } from "@teacher-helper/domain";
import { SubscriptionStatus } from "./subscription-status";

export function BillingOverview({
  summary,
  rows,
}: {
  summary: AdminBillingSummary;
  rows: readonly AdminBillingRow[];
}) {
  return (
    <>
      <section className="admin-summary" aria-label="Billing health summary">
        <article className="admin-summary__card">
          <p>Overdue centres</p>
          <strong>{summary.overdueCentres}</strong>
          <span>payment risk requiring review</span>
        </article>
        <article className="admin-summary__card">
          <p>Failed payments</p>
          <strong>{summary.failedPayments}</strong>
          <span>unsuccessful collection attempts</span>
        </article>
        <article className="admin-summary__card admin-summary__card--accent">
          <p>Monthly recurring revenue</p>
          <strong>R {summary.monthlyRecurringRevenue}</strong>
          <span>business-safe portfolio total</span>
        </article>
        <article className="admin-summary__card">
          <p>Follow-up centres</p>
          <strong>{summary.followUpCentres}</strong>
          <span>owner action recommended</span>
        </article>
      </section>

      <section className="admin-section" aria-labelledby="billing-table-title">
        <div className="admin-section__heading">
          <div>
            <p className="admin-section__eyebrow">Subscription health</p>
            <h2 id="billing-table-title">Centre billing status</h2>
          </div>
          <span className="admin-section__meta">Currency: ZAR</span>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Centre</th>
                <th scope="col">Plan</th>
                <th scope="col">Status</th>
                <th scope="col">Last payment</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.centreId}>
                  <th scope="row">{row.centreName}</th>
                  <td>{row.planName}</td>
                  <td>
                    <SubscriptionStatus status={row.status} />
                  </td>
                  <td>
                    {row.lastPaymentAt
                      ? row.lastPaymentAt.toLocaleDateString("en-ZA")
                      : "Not recorded"}
                  </td>
                  <td>
                    {row.followUpRequired ? (
                      <a href={`/admin/centres/${row.centreId}`}>Follow up</a>
                    ) : (
                      <span>Healthy</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-section" aria-labelledby="plan-adoption-title">
        <div className="admin-section__heading">
          <div>
            <p className="admin-section__eyebrow">Portfolio mix</p>
            <h2 id="plan-adoption-title">Plan adoption</h2>
          </div>
        </div>
        <ul className="admin-plan-list">
          {Object.entries(summary.planAdoption).map(([plan, count]) => (
            <li key={plan}>
              <span>{plan}</span>
              <strong>{count} centres</strong>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
