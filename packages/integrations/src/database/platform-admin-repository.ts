export type PlatformCentreSummary = {
  centreId: string;
  name: string;
  status: string;
  subscriptionStatus: string | null;
  ownerContact: string | null;
  lastPaymentAt: Date | null;
  supportFlag: boolean;
};

export type PlatformAlertSummary = {
  alertId: string;
  centreId: string;
  type: string;
  severity: "info" | "warning" | "critical";
  status: "open" | "acknowledged" | "resolved";
  summary: string;
  resolvedAt: Date | null;
};

export type PlatformDashboardSummary = {
  activeCentres: number;
  trialCentres: number;
  pastDueCentres: number;
  openAlerts: number;
  atRiskCount: number;
};

export type PlatformCentreDetail = PlatformCentreSummary & {
  openAlerts: readonly PlatformAlertSummary[];
};

type Queryable = {
  query<T extends Record<string, unknown>>(text: string, values?: readonly unknown[]): Promise<{ rows: T[] }>;
};

export interface PlatformAdminRepository {
  listCentres(input?: { limit?: number; offset?: number }): Promise<readonly PlatformCentreSummary[]>;
  listAlerts(input?: { limit?: number; offset?: number }): Promise<readonly PlatformAlertSummary[]>;
  getDashboardSummary(): Promise<PlatformDashboardSummary>;
  getCentre(centreId: string, actorAdminId: string, requestId: string): Promise<PlatformCentreDetail | null>;
}

const CENTRE_LIMIT = 100;
const ALERT_LIMIT = 100;

function bounded(value: number | undefined, maximum: number): number {
  return Math.min(Math.max(Math.floor(value ?? maximum), 1), maximum);
}

export function createPostgresPlatformAdminRepository(client: Queryable): PlatformAdminRepository {
  return {
    async listCentres(input) {
      const limit = bounded(input?.limit, CENTRE_LIMIT);
      const offset = Math.max(Math.floor(input?.offset ?? 0), 0);
      const result = await client.query<PlatformCentreSummary>(
        `SELECT c.id AS "centreId", c.name, c.status,
                s.status AS "subscriptionStatus", owner_user.email AS "ownerContact",
                MAX(CASE WHEN payment.status = 'paid' THEN payment.occurred_at END) AS "lastPaymentAt",
                (c.status = 'flagged' OR s.status IN ('past_due', 'at_risk')) AS "supportFlag"
           FROM app.centres c
           LEFT JOIN app.saas_subscriptions s ON s.centre_id = c.id AND s.status <> 'cancelled'
           LEFT JOIN app.centre_memberships owner_membership
             ON owner_membership.centre_id = c.id
            AND owner_membership.role = 'owner'
            AND owner_membership.status = 'active'
           LEFT JOIN app.users owner_user ON owner_user.id = owner_membership.user_id
           LEFT JOIN app.saas_payment_events payment ON payment.centre_id = c.id
          GROUP BY c.id, c.name, c.status, s.status, owner_user.email
          ORDER BY c.created_at DESC, c.id
          LIMIT $1 OFFSET $2`,
        [limit, offset],
      );
      return result.rows;
    },

    async listAlerts(input) {
      const limit = bounded(input?.limit, ALERT_LIMIT);
      const offset = Math.max(Math.floor(input?.offset ?? 0), 0);
      const result = await client.query<PlatformAlertSummary>(
        `SELECT id AS "alertId", centre_id AS "centreId", 'payment_risk' AS type,
                CASE WHEN status IN ('failed', 'disputed') THEN 'critical' ELSE 'warning' END AS severity,
                CASE WHEN status IN ('failed', 'disputed') THEN 'open' ELSE 'acknowledged' END AS status,
                'SaaS payment requires platform follow-up.' AS summary,
                NULL::timestamptz AS "resolvedAt"
           FROM app.saas_payment_events
          WHERE status IN ('failed', 'overdue', 'disputed')
          ORDER BY occurred_at DESC, id
          LIMIT $1 OFFSET $2`,
        [limit, offset],
      );
      return result.rows;
    },

    async getDashboardSummary() {
      const result = await client.query<PlatformDashboardSummary>(
        `SELECT
            COUNT(*) FILTER (WHERE c.status = 'active')::int AS "activeCentres",
            COUNT(*) FILTER (WHERE s.status = 'trial')::int AS "trialCentres",
            COUNT(*) FILTER (WHERE s.status = 'past_due')::int AS "pastDueCentres",
            COUNT(*) FILTER (WHERE payment.status IN ('failed', 'overdue', 'disputed'))::int AS "openAlerts",
            COUNT(*) FILTER (WHERE c.status = 'flagged' OR s.status IN ('past_due', 'at_risk'))::int AS "atRiskCount"
          FROM app.centres c
          LEFT JOIN app.saas_subscriptions s ON s.centre_id = c.id AND s.status <> 'cancelled'
          LEFT JOIN app.saas_payment_events payment ON payment.centre_id = c.id`,
      );
      return result.rows[0] ?? { activeCentres: 0, trialCentres: 0, pastDueCentres: 0, openAlerts: 0, atRiskCount: 0 };
    },

    async getCentre(centreId, actorAdminId, requestId) {
      const result = await client.query<PlatformCentreSummary>(
        `SELECT c.id AS "centreId", c.name, c.status,
                s.status AS "subscriptionStatus", owner_user.email AS "ownerContact",
                MAX(CASE WHEN payment.status = 'paid' THEN payment.occurred_at END) AS "lastPaymentAt",
                (c.status = 'flagged' OR s.status IN ('past_due', 'at_risk')) AS "supportFlag"
           FROM app.centres c
           LEFT JOIN app.saas_subscriptions s ON s.centre_id = c.id AND s.status <> 'cancelled'
           LEFT JOIN app.centre_memberships owner_membership
             ON owner_membership.centre_id = c.id AND owner_membership.role = 'owner' AND owner_membership.status = 'active'
           LEFT JOIN app.users owner_user ON owner_user.id = owner_membership.user_id
           LEFT JOIN app.saas_payment_events payment ON payment.centre_id = c.id
          WHERE c.id = $1
          GROUP BY c.id, c.name, c.status, s.status, owner_user.email`,
        [centreId],
      );
      if (!result.rows[0]) return null;
      await client.query(
        `INSERT INTO app.platform_audit_events
          (actor_admin_id, target_centre_id, action, outcome, request_id, metadata)
         VALUES ($1, $2, 'centre.read', 'allowed', $3, '{}'::jsonb)`,
        [actorAdminId, centreId, requestId],
      );
      const alerts = await client.query<PlatformAlertSummary>(
        `SELECT id AS "alertId", centre_id AS "centreId", 'payment_risk' AS type,
                CASE WHEN status IN ('failed', 'disputed') THEN 'critical' ELSE 'warning' END AS severity,
                CASE WHEN status IN ('failed', 'disputed') THEN 'open' ELSE 'acknowledged' END AS status,
                'SaaS payment requires platform follow-up.' AS summary,
                NULL::timestamptz AS "resolvedAt"
           FROM app.saas_payment_events
          WHERE centre_id = $1 AND status IN ('failed', 'overdue', 'disputed')
          ORDER BY occurred_at DESC, id
          LIMIT $2`,
        [centreId, ALERT_LIMIT],
      );
      return { ...result.rows[0], openAlerts: alerts.rows };
    },
  };
}