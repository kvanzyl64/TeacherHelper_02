import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { describe, expect, it } from "vitest";
import { createPostgresPlatformAlertRepository } from "../../packages/integrations/src/admin/postgres-alerts";
import { createPostgresSupportCaseRepository } from "../../packages/integrations/src/admin/postgres-support-cases";
import { requirePlatformOwner } from "../../apps/web/lib/auth/dal";

const databaseUrl = process.env.TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;

suite("PostgreSQL platform alerts", () => {
  it("keeps alert context safe, denies non-owners, and appends lifecycle audit events", async () => {
    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();
    const centreId = randomUUID();
    const adminId = randomUUID();
    const subscriptionId = randomUUID();
    const paymentId = randomUUID();
    const exportId = randomUUID();
    const retentionId = randomUUID();
    const backupAlertId = randomUUID();
    const supportCaseId = randomUUID();
    try {
      await client.query("BEGIN");
      await client.query("INSERT INTO app.centres (id, name, status) VALUES ($1, 'Operations Centre', 'active')", [centreId]);
      await client.query("INSERT INTO app.platform_admins (id, email, display_name, role, status) VALUES ($1, $2, 'Synthetic Operations Admin', 'platform_owner', 'active')", [adminId, `${adminId}@synthetic.invalid`]);
      await client.query("INSERT INTO app.saas_subscriptions (id, centre_id, plan_name, status, started_at, monthly_value) VALUES ($1, $2, 'Growth', 'active', now(), 1200.00)", [subscriptionId, centreId]);
      await client.query("INSERT INTO app.saas_payment_events (id, subscription_id, centre_id, amount, status, occurred_at, follow_up_required) VALUES ($1, $2, $3, 1200.00, 'failed', now(), true)", [paymentId, subscriptionId, centreId]);
      await client.query("INSERT INTO app.export_requests (id, centre_id, requested_by, scope, status, storage_reference) VALUES ($1, $2, $3, 'centre', 'failed', 'synthetic://export')", [exportId, centreId, randomUUID()]);
      await client.query("INSERT INTO app.retention_jobs (id, centre_id, retention_class, status) VALUES ($1, $2, 'audit', 'failed')", [retentionId, centreId]);
      await client.query("INSERT INTO app.platform_audit_events (id, actor_admin_id, target_centre_id, action, outcome, request_id, metadata) VALUES ($1, $2, $3, 'alert.created', 'allowed', $4, $5::jsonb)", [backupAlertId, adminId, centreId, randomUUID(), JSON.stringify({ alert_id: backupAlertId, type: "backup_issue", severity: "critical", summary: "Backup recovery requires review." })]);
      await client.query("INSERT INTO app.platform_audit_events (id, actor_admin_id, target_centre_id, action, outcome, request_id, metadata) VALUES ($1, $2, $3, 'support.case.created', 'allowed', $4, $5::jsonb)", [supportCaseId, adminId, centreId, randomUUID(), JSON.stringify({ case_id: supportCaseId, issue_type: "operations", owner: "platform_owner", summary: "Synthetic operations follow-up." })]);

      const alerts = createPostgresPlatformAlertRepository(client);
      const cases = createPostgresSupportCaseRepository(client);
      const rows = await alerts.listAlerts({ limit: 20 });
      const supportRows = await cases.listCases({ limit: 20 });

      expect(rows.map((row) => row.type)).toEqual(expect.arrayContaining(["payment_risk", "export_failure", "retention_warning", "backup_issue"]));
      expect(supportRows).toEqual([expect.objectContaining({ caseId: supportCaseId, issueType: "operations", status: "open" })]);
      expect(Object.keys(rows[0]).sort()).toEqual(["alertId", "centreId", "occurredAt", "recoveryAction", "severity", "status", "summary", "type"].sort());
      await alerts.updateAlertStatus(paymentId, "acknowledged", adminId, randomUUID());
      await alerts.updateAlertStatus(paymentId, "acknowledged", adminId, randomUUID());
      expect((await client.query("SELECT action, outcome FROM app.platform_audit_events WHERE target_centre_id = $1 AND action = 'alert.acknowledge'", [centreId])).rows).toHaveLength(1);
      expect(() => requirePlatformOwner({ identityId: randomUUID(), issuer: "https://issuer.synthetic.invalid", subject: "centre-user", userId: randomUUID(), platformAdminId: null, platformRole: null, platformStatus: null })).toThrow("The requested resource is unavailable");
      await client.query("ROLLBACK");
    } finally {
      await client.query("ROLLBACK").catch(() => undefined);
      client.release();
      await pool.end();
    }
  });
});
