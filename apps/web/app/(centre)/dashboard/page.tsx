import { Icon } from "../../../components/navigation/icon";

const metrics = [
  { label: "active students", icon: "people" },
  { label: "sessions this week", icon: "sessions" },
  { label: "updates delivered", icon: "whatsapp" },
] as const;

export default function CentreDashboardPage() {
  const date = new Intl.DateTimeFormat("en-ZA", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "Africa/Johannesburg",
  }).format(new Date());

  return (
    <main className="centre-overview" aria-label="Centre dashboard">
      <header className="centre-overview__bar">
        <p className="centre-overview__brand">
          <span aria-hidden="true" />
          Teacher Helper / Overview
        </p>
        <time className="centre-overview__date">{date}</time>
      </header>

      <div className="centre-overview__body">
        <section className="centre-overview__main" aria-labelledby="centre-overview-title">
          <p className="centre-overview__greeting">Your centre workspace</p>
          <h1 id="centre-overview-title">The centre at a glance.</h1>

          <div className="centre-overview__metrics" aria-label="Centre metrics">
            {metrics.map((metric) => (
              <article className="centre-overview__metric" key={metric.label}>
                <Icon name={metric.icon} size={17} />
                <strong aria-label={`${metric.label}: unavailable`}>—</strong>
                <span>{metric.label}</span>
              </article>
            ))}
          </div>
          <p className="centre-overview__data-note">
            Live figures will appear when this workspace is connected to centre data.
          </p>

          <section className="centre-overview__activity" aria-labelledby="recent-activity-title">
            <div className="centre-overview__activity-heading">
              <h2 id="recent-activity-title">Recent activity</h2>
              <span>No activity yet</span>
            </div>
            <div className="centre-overview__empty-activity">
              <span className="centre-overview__empty-icon" aria-hidden="true">
                <Icon name="calendar" size={18} />
              </span>
              <p>New sessions, guardian updates, and payments will appear here.</p>
            </div>
          </section>
        </section>

        <aside className="centre-overview__human" aria-label="A little encouragement">
          <p className="centre-overview__human-label">The human bit</p>
          <img
            src="/images/line-art/character-helper.svg"
            alt="A friendly learning helper"
            width="160"
            height="180"
          />
          <p className="centre-overview__human-note">
            A little more room for the work that matters.
          </p>
        </aside>
      </div>
    </main>
  );
}
