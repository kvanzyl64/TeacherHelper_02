import type { DashboardSummary } from "@teacher-helper/domain";

type QueryClient = {
  query<T extends Record<string, unknown> = Record<string, unknown>>(text: string, values?: readonly unknown[]): Promise<{ rows: T[] }>;
};

export type CentreActivity = {
  id: string;
  eventType: string;
  occurredAt: Date;
};

export type CentreDashboardData = {
  summary: DashboardSummary;
  updatesDelivered: number;
  activity: readonly CentreActivity[];
};

export function createPostgresCentreDashboardRepository(client: QueryClient) {
  return {
    async getData(): Promise<CentreDashboardData> {
      const result = await client.query<DashboardRow>(`
        SELECT
          (SELECT count(*)::int FROM app.students WHERE enrolment_status = 'active') AS active_students,
          (SELECT count(*)::int FROM app.sessions WHERE occurred_at >= date_trunc('week', now())) AS weekly_sessions,
          (SELECT count(*)::int FROM app.invoices WHERE status IN ('issued', 'partially_paid', 'disputed', 'failed')) AS outstanding_invoices,
          (SELECT count(*)::int FROM app.audit_events WHERE occurred_at >= now() - interval '30 days') AS unresolved_events,
          (SELECT count(*)::int FROM app.notifications WHERE status = 'failed') AS alert_count,
          (SELECT count(*)::int FROM app.notifications WHERE status = 'delivered') AS updates_delivered`);
      const activity = await client.query<ActivityRow>(`
        SELECT id, event_type, occurred_at
          FROM app.audit_events
         ORDER BY occurred_at DESC
         LIMIT 8`);
      const row = result.rows[0];
      const activeStudents = row?.active_students ?? 0;
      const weeklySessions = row?.weekly_sessions ?? 0;
      const outstandingInvoices = row?.outstanding_invoices ?? 0;
      const unresolvedEvents = row?.unresolved_events ?? 0;
      const alertCount = row?.alert_count ?? 0;
      return {
        summary: {
          activeStudents,
          weeklySessions,
          outstandingInvoices,
          unresolvedEvents,
          alertCount,
          alertLevel: alertCount > 5 ? "critical" : alertCount > 0 ? "attention" : "healthy",
        },
        updatesDelivered: row?.updates_delivered ?? 0,
        activity: activity.rows.map((item) => ({ id: item.id, eventType: item.event_type, occurredAt: item.occurred_at })),
      };
    },
  };
}

type DashboardRow = {
  active_students: number;
  weekly_sessions: number;
  outstanding_invoices: number;
  unresolved_events: number;
  alert_count: number;
  updates_delivered: number;
};

type ActivityRow = {
  id: string;
  event_type: string;
  occurred_at: Date;
};