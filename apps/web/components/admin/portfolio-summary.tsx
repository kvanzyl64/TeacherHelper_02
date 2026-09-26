import type { AdminDashboardSummary } from "@teacher-helper/domain/src/admin/dashboard-summary";

export function PortfolioSummary({ summary }: { summary: AdminDashboardSummary }) {
  const cards = [
    { label: "Active centres", value: summary.activeCentres, detail: "currently operating" },
    { label: "Trial centres", value: summary.trialCentres, detail: "in evaluation" },
    { label: "Overdue centres", value: summary.pastDueCentres, detail: "need payment follow-up" },
    { label: "Open alerts", value: summary.openAlerts, detail: "awaiting resolution" },
  ];

  return (
    <section className="admin-summary" aria-label="Portfolio health summary">
      {cards.map((card) => (
        <article className="admin-summary__card" key={card.label}>
          <p>{card.label}</p>
          <strong>{card.value}</strong>
          <span>{card.detail}</span>
        </article>
      ))}
      <article className="admin-summary__card admin-summary__card--accent">
        <p>At-risk centres</p>
        <strong>{summary.atRiskCount}</strong>
        <span>priority action items</span>
      </article>
    </section>
  );
}
