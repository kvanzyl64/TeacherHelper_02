import type { SupportCase, SupportCaseStatus } from "@teacher-helper/domain";

type Queryable = {
  query<T extends Record<string, unknown>>(
    text: string,
    values?: readonly unknown[],
  ): Promise<{ rows: T[]; rowCount?: number | null }>;
};

export interface PlatformSupportCaseRepository {
  listCases(input?: { limit?: number; offset?: number }): Promise<readonly SupportCase[]>;
  updateCaseStatus(caseId: string, status: Exclude<SupportCaseStatus, "open">, actorAdminId: string, requestId: string): Promise<void>;
}

const LIMIT = 100;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function bounded(value: number | undefined): number {
  return Math.min(Math.max(Math.floor(value ?? LIMIT), 1), LIMIT);
}

export function createPostgresSupportCaseRepository(client: Queryable): PlatformSupportCaseRepository {
  return {
    async listCases(input) {
      const result = await client.query<SupportCase>(
        `WITH cases AS (
           SELECT metadata->>'case_id' AS case_id, target_centre_id AS centre_id,
                  metadata->>'issue_type' AS issue_type, metadata->>'owner' AS owner,
                  metadata->>'summary' AS summary, occurred_at
             FROM app.platform_audit_events
            WHERE action = 'support.case.created' AND outcome = 'allowed'
         ), lifecycle AS (
           SELECT metadata->>'case_id' AS case_id, action,
                  ROW_NUMBER() OVER (PARTITION BY metadata->>'case_id' ORDER BY occurred_at DESC, id DESC) AS position
             FROM app.platform_audit_events
            WHERE action IN ('support.case.in_review', 'support.case.resolve') AND outcome = 'allowed'
         )
         SELECT c.case_id AS "caseId", c.centre_id AS "centreId", c.issue_type AS "issueType",
                c.owner, CASE WHEN l.action = 'support.case.resolve' THEN 'resolved'
                              WHEN l.action = 'support.case.in_review' THEN 'in_review'
                              ELSE 'open' END AS status, c.summary
           FROM cases c
           LEFT JOIN lifecycle l ON l.case_id = c.case_id AND l.position = 1
          ORDER BY c.occurred_at DESC, c.case_id
          LIMIT $1 OFFSET $2`,
        [bounded(input?.limit), Math.max(Math.floor(input?.offset ?? 0), 0)],
      );
      return result.rows;
    },

    async updateCaseStatus(caseId, status, actorAdminId, requestId) {
      if (!uuidPattern.test(caseId)) throw new Error("The requested resource is unavailable");
      const action = status === "resolved" ? "support.case.resolve" : "support.case.in_review";
      await client.query("BEGIN");
      try {
        const duplicate = await client.query<{ id: string }>("SELECT id FROM app.platform_audit_events WHERE request_id = $1 AND action = $2 LIMIT 1", [requestId, action]);
        if (duplicate.rows[0]) {
          await client.query("COMMIT");
          return;
        }
        const source = await client.query<{ target_centre_id: string }>("SELECT target_centre_id FROM app.platform_audit_events WHERE action = 'support.case.created' AND outcome = 'allowed' AND metadata->>'case_id' = $1 LIMIT 1", [caseId]);
        if (!source.rows[0]) throw new Error("The requested resource is unavailable");
        await client.query("INSERT INTO app.platform_audit_events (actor_admin_id, target_centre_id, action, outcome, request_id, metadata) VALUES ($1, $2, $3, 'allowed', $4, jsonb_build_object('case_id', $5))", [actorAdminId, source.rows[0].target_centre_id, action, requestId, caseId]);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    },
  };
}
