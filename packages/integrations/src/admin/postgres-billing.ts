import type { AdminBillingRow, AdminBillingSummary } from "@teacher-helper/domain";

type Queryable = {
  query<T extends Record<string, unknown>>(
    text: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[]; rowCount?: number | null }>;
};

export interface PlatformBillingRepository {
  listRows(input?: { limit?: number; offset?: number }): Promise<readonly AdminBillingRow[]>;
  getSummary(): Promise<AdminBillingSummary>;
  updatePayment(
    paymentId: string,
    input: {
      status: NonNullable<AdminBillingRow["paymentStatus"]>;
      followUpRequired: boolean;
    },
    actorAdminId: string,
    requestId: string,
  ): Promise<void>;
}

const ROW_LIMIT = 100;
const PAYMENT_STATUSES = ["paid", "failed", "pending", "overdue", "disputed"] as const;

function bounded(value: number | undefined): number {
  return Math.min(Math.max(Math.floor(value ?? ROW_LIMIT), 1), ROW_LIMIT);
}

const latestSubscriptions = `
  WITH latest_subscriptions AS (
    SELECT DISTINCT ON (centre_id)
      id, centre_id, plan_name, status, monthly_value, currency
    FROM app.saas_subscriptions
    ORDER BY centre_id, updated_at DESC, created_at DESC, id DESC
  )`;

const paymentRollup = `
  payment_rollup AS (
    SELECT
      centre_id,
      MAX(occurred_at) FILTER (WHERE status = 'paid') AS last_payment_at,
      (ARRAY_AGG(id ORDER BY occurred_at DESC, id DESC))[1] AS payment_id,
      (ARRAY_AGG(status ORDER BY occurred_at DESC, id DESC))[1] AS payment_status,
      COALESCE(SUM(amount) FILTER (WHERE status IN ('failed', 'overdue', 'disputed')), 0)::numeric(12, 2) AS overdue_amount,
      BOOL_OR(follow_up_required OR status IN ('failed', 'overdue', 'disputed')) AS follow_up_required
    FROM app.saas_payment_events
    GROUP BY centre_id
  )`;

export function createPostgresBillingRepository(client: Queryable): PlatformBillingRepository {
  return {
    async listRows(input) {
      const limit = bounded(input?.limit);
      const offset = Math.max(Math.floor(input?.offset ?? 0), 0);
      const result = await client.query<AdminBillingRow & { paymentId: string | null }>(
        `${latestSubscriptions}, ${paymentRollup}
         SELECT c.id AS "centreId", c.name AS "centreName", s.plan_name AS "planName",
                s.status, s.monthly_value::text AS "monthlyValue", s.currency,
                p.last_payment_at AS "lastPaymentAt", p.overdue_amount::text AS "overdueAmount",
                COALESCE(p.follow_up_required, false) AS "followUpRequired",
                p.payment_status AS "paymentStatus", p.payment_id AS "paymentId"
           FROM latest_subscriptions s
           JOIN app.centres c ON c.id = s.centre_id
           LEFT JOIN payment_rollup p ON p.centre_id = s.centre_id
          ORDER BY c.name, c.id
          LIMIT $1 OFFSET $2`,
        [limit, offset],
      );
      return result.rows;
    },

    async getSummary() {
      const result = await client.query<AdminBillingSummary & { planAdoption: Record<string, number> }>(
        `${latestSubscriptions}, ${paymentRollup},
         plan_counts AS (
           SELECT plan_name, COUNT(*)::int AS count
           FROM latest_subscriptions
           WHERE status <> 'cancelled'
           GROUP BY plan_name
         )
         SELECT
           COUNT(*) FILTER (WHERE s.status = 'past_due' OR COALESCE(p.overdue_amount, 0) > 0)::int AS "overdueCentres",
           (SELECT COUNT(*)::int FROM app.saas_payment_events WHERE status = 'failed') AS "failedPayments",
           COUNT(*) FILTER (WHERE COALESCE(p.follow_up_required, false) OR s.status IN ('past_due', 'at_risk'))::int AS "followUpCentres",
           COALESCE(SUM(s.monthly_value) FILTER (WHERE s.status <> 'cancelled'), 0)::numeric(12, 2)::text AS "monthlyRecurringRevenue",
           COALESCE((SELECT jsonb_object_agg(plan_name, count) FROM plan_counts), '{}'::jsonb) AS "planAdoption"
         FROM latest_subscriptions s
         LEFT JOIN payment_rollup p ON p.centre_id = s.centre_id`,
      );
      return result.rows[0] ?? {
        overdueCentres: 0,
        failedPayments: 0,
        followUpCentres: 0,
        monthlyRecurringRevenue: "0.00",
        planAdoption: {},
      };
    },

    async updatePayment(paymentId, input, actorAdminId, requestId) {
      if (!PAYMENT_STATUSES.includes(input.status)) throw new Error("Invalid SaaS payment status");
      await client.query("BEGIN");
      try {
        const existing = await client.query<{ id: string }>(
          "SELECT id FROM app.platform_audit_events WHERE request_id = $1 AND action = 'billing.payment.update' LIMIT 1",
          [requestId],
        );
        if (existing.rows[0]) {
          await client.query("COMMIT");
          return;
        }
        const current = await client.query<{ status: string; follow_up_required: boolean }>(
          "SELECT status, follow_up_required FROM app.saas_payment_events WHERE id = $1",
          [paymentId],
        );
        if (!current.rows[0]) throw new Error("The requested resource is unavailable");
        if (current.rows[0].status === input.status && current.rows[0].follow_up_required === input.followUpRequired) {
          await client.query("COMMIT");
          return;
        }
        const updated = await client.query<{ id: string }>(
          `UPDATE app.saas_payment_events
              SET status = $2, follow_up_required = $3
            WHERE id = $1
            RETURNING id`,
          [paymentId, input.status, input.followUpRequired],
        );
        if (!updated.rows[0]) throw new Error("The requested resource is unavailable");
        await client.query(
          `INSERT INTO app.platform_audit_events
            (actor_admin_id, action, outcome, request_id, metadata)
           VALUES ($1, 'billing.payment.update', 'allowed', $2, jsonb_build_object('payment_id', $3, 'status', $4, 'follow_up_required', $5))`,
          [actorAdminId, requestId, paymentId, input.status, input.followUpRequired],
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    },
  };
}
