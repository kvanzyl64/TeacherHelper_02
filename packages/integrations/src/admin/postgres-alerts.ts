import type { AdminAlertStatus, OperationalAlert } from "@teacher-helper/domain";

type Queryable = {
  query<T extends Record<string, unknown>>(
    text: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[]; rowCount?: number | null }>;
};

export type PlatformOperationalAlert = OperationalAlert & {
  occurredAt: Date;
  recoveryAction: string;
};

export interface PlatformAlertRepository {
  listAlerts(input?: { limit?: number; offset?: number }): Promise<readonly PlatformOperationalAlert[]>;
  updateAlertStatus(
    alertId: string,
    status: Exclude<AdminAlertStatus, "open">,
    actorAdminId: string,
    requestId: string,
  ): Promise<void>;
}

const LIMIT = 100;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function bounded(value: number | undefined): number {
  return Math.min(Math.max(Math.floor(value ?? LIMIT), 1), LIMIT);
}

const alertSources = `
  WITH lifecycle AS (
    SELECT metadata->>'alert_id' AS alert_id, action,
           ROW_NUMBER() OVER (PARTITION BY metadata->>'alert_id' ORDER BY occurred_at DESC, id DESC) AS position
      FROM app.platform_audit_events
     WHERE action IN ('alert.acknowledge', 'alert.resolve') AND outcome = 'allowed'
  ),
  source_alerts AS (
    SELECT id::text AS alert_id, centre_id, 'payment_risk'::text AS type,
           CASE WHEN status IN ('failed', 'disputed') THEN 'critical' ELSE 'warning' END::text AS severity,
           occurred_at, 'SaaS payment requires follow-up.'::text AS summary,
           'Review the subscription payment and contact the centre owner.'::text AS recovery_action
      FROM app.saas_payment_events
     WHERE status IN ('failed', 'overdue', 'disputed')
    UNION ALL
    SELECT id::text, centre_id, 'export_failure', 'critical', requested_at,
           'A centre export failed and requires review.', 'Review the export failure and retry or expire the request.'
      FROM app.export_requests
     WHERE status = 'failed'
    UNION ALL
    SELECT id::text, centre_id, 'retention_warning', 'warning', created_at,
           'A retention job failed and requires review.', 'Review the retention job and verify the protected data path.'
      FROM app.retention_jobs
     WHERE status = 'failed'
    UNION ALL
    SELECT metadata->>'alert_id', target_centre_id, metadata->>'type',
           COALESCE(metadata->>'severity', 'warning'), occurred_at,
           COALESCE(metadata->>'summary', 'A platform operational alert requires review.'),
           COALESCE(metadata->>'recovery_action', 'Review the platform operational context and record the recovery step.')
      FROM app.platform_audit_events
     WHERE action = 'alert.created' AND outcome = 'allowed'
  )`;

export function createPostgresPlatformAlertRepository(client: Queryable): PlatformAlertRepository {
  return {
    async listAlerts(input) {
      const limit = bounded(input?.limit);
      const offset = Math.max(Math.floor(input?.offset ?? 0), 0);
      const result = await client.query<PlatformOperationalAlert>(
        `${alertSources}
         SELECT s.alert_id AS "alertId", s.centre_id AS "centreId", s.type,
                s.severity,
                CASE WHEN l.action = 'alert.resolve' THEN 'resolved'
                     WHEN l.action = 'alert.acknowledge' THEN 'acknowledged'
                     ELSE 'open' END AS status,
                s.summary, s.occurred_at AS "occurredAt", s.recovery_action AS "recoveryAction"
           FROM source_alerts s
           LEFT JOIN lifecycle l ON l.alert_id = s.alert_id AND l.position = 1
          ORDER BY s.occurred_at DESC, s.alert_id
          LIMIT $1 OFFSET $2`,
        [limit, offset],
      );
      return result.rows;
    },

    async updateAlertStatus(alertId, status, actorAdminId, requestId) {
      if (!uuidPattern.test(alertId)) throw new Error("The requested resource is unavailable");
      await client.query("BEGIN");
      try {
        const request = await client.query<{ id: string }>(
          "SELECT id FROM app.platform_audit_events WHERE request_id = $1 AND action IN ('alert.acknowledge', 'alert.resolve') LIMIT 1",
          [requestId],
        );
        if (request.rows[0]) {
          await client.query("COMMIT");
          return;
        }
        const source = await client.query<{ id: string }>(
          `SELECT id FROM app.saas_payment_events WHERE id = $1::uuid
           UNION ALL SELECT id FROM app.export_requests WHERE id = $1::uuid
           UNION ALL SELECT id FROM app.retention_jobs WHERE id = $1::uuid
           UNION ALL SELECT id FROM app.platform_audit_events WHERE id = $1::uuid AND action = 'alert.created'
           LIMIT 1`,
          [alertId],
        );
        if (!source.rows[0]) throw new Error("The requested resource is unavailable");
        const latest = await client.query<{ action: string }>(
          "SELECT action FROM app.platform_audit_events WHERE metadata->>'alert_id' = $1 AND action IN ('alert.acknowledge', 'alert.resolve') AND outcome = 'allowed' ORDER BY occurred_at DESC, id DESC LIMIT 1",
          [alertId],
        );
        const current: AdminAlertStatus = latest.rows[0]?.action === "alert.resolve" ? "resolved" : latest.rows[0]?.action === "alert.acknowledge" ? "acknowledged" : "open";
        if (current === status || current === "resolved") {
          await client.query("COMMIT");
          return;
        }
        if (status === "acknowledged" && current !== "open") throw new Error("Invalid alert state transition");
        await client.query(
          `INSERT INTO app.platform_audit_events
            (actor_admin_id, target_centre_id, action, outcome, request_id, metadata)
           SELECT $1, target_centre_id, $2, 'allowed', $3, jsonb_build_object('alert_id', $4)
             FROM app.platform_audit_events
            WHERE id = $5::uuid AND action = 'alert.created'
           UNION ALL
          SELECT $1, centre_id, $2, 'allowed', $3, jsonb_build_object('alert_id', $4)
            FROM app.saas_payment_events WHERE id = $5::uuid
           UNION ALL
          SELECT $1, centre_id, $2, 'allowed', $3, jsonb_build_object('alert_id', $4)
            FROM app.export_requests WHERE id = $5::uuid
           UNION ALL
          SELECT $1, centre_id, $2, 'allowed', $3, jsonb_build_object('alert_id', $4)
            FROM app.retention_jobs WHERE id = $5::uuid`,
          [actorAdminId, status === "resolved" ? "alert.resolve" : "alert.acknowledge", requestId, alertId, alertId],
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    },
  };
}
