import type { CentreRecord, OnboardingRepository } from "@teacher-helper/domain";

type QueryClient = {
  query<T extends Record<string, unknown> = Record<string, unknown>>(text: string, values?: readonly unknown[]): Promise<{ rows: T[]; rowCount: number | null }>;
};

export function createPostgresOnboardingRepository(client: QueryClient): OnboardingRepository {
  return {
    async findByActiveName(name) {
      const result = await client.query<CentreRecordRow>(
        `SELECT id, name, timezone, status, created_at, updated_at,
                CASE WHEN status = 'trial' THEN 'trial' ELSE 'subscription' END AS plan,
                NULL::text AS created_by
           FROM app.centres
          WHERE lower(trim(name)) = lower(trim($1))
            AND status IN ('onboarding', 'trial', 'active', 'suspended')
          LIMIT 1`,
        [name],
      );
      return result.rows[0] ? mapCentre(result.rows[0]) : null;
    },

    async insert(record) {
      await client.query(
        `INSERT INTO app.centres (id, name, status, timezone, billing_settings)
         VALUES ($1, $2, $3, $4, jsonb_build_object('plan', $5::text))`,
        [record.id, record.name, record.status, record.timezone, record.plan],
      );
      await client.query(
        `INSERT INTO app.centre_memberships (centre_id, user_id, role, status, accepted_at)
         VALUES ($1, $2, 'owner', 'active', now())`,
        [record.id, record.createdBy],
      );
      await client.query(
        `INSERT INTO app.saas_subscriptions
          (centre_id, plan_name, status, started_at, trial_ends_at, monthly_value)
         VALUES ($1, $2, $3, now(), CASE WHEN $3 = 'trial' THEN now() + interval '14 days' END, 0)`,
        [record.id, record.plan, record.status === "trial" ? "trial" : "active"],
      );
      await client.query(
        `INSERT INTO app.audit_events
          (centre_id, actor_user_id, event_type, entity_type, entity_id, request_id, metadata)
         VALUES ($1, $2, 'centre.created', 'centre', $3, $4, $5)`,
        [record.id, record.createdBy, record.id, `onboarding-${record.id}`, JSON.stringify({ plan: record.plan })],
      );
      return record;
    },

    async updateStatus(id, status) {
      const result = await client.query<CentreRecordRow>(
        `UPDATE app.centres SET status = $2, updated_at = now()
          WHERE id = $1
      RETURNING id, name, timezone, status, created_at, updated_at,
                CASE WHEN status = 'trial' THEN 'trial' ELSE 'subscription' END AS plan,
                NULL::text AS created_by`,
        [id, status],
      );
      if (!result.rows[0]) throw new Error("Centre record was not found");
      return mapCentre(result.rows[0]);
    },
  };
}

type CentreRecordRow = {
  id: string;
  name: string;
  timezone: string;
  status: CentreRecord["status"];
  plan: CentreRecord["plan"];
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
};

function mapCentre(row: CentreRecordRow): CentreRecord {
  return {
    id: row.id,
    name: row.name,
    timezone: row.timezone,
    plan: row.plan,
    status: row.status,
    createdBy: row.created_by ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}