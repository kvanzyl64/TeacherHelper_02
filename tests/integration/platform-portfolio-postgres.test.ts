import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { describe, expect, it } from "vitest";
import { createPostgresPlatformAdminRepository } from "../../packages/integrations/src/database/platform-admin-repository";
import { requirePlatformOwner } from "../../apps/web/lib/auth/dal";

const databaseUrl = process.env.TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;

suite("PostgreSQL platform portfolio", () => {
  it("returns bounded business-safe aggregates and audited centre detail", async () => {
    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();
    const centreId = randomUUID();
    const userId = randomUUID();
    const adminId = randomUUID();
    try {
      await client.query("BEGIN");
      await client.query(
        "INSERT INTO app.users (id, email, display_name, authentication_status) VALUES ($1, $2, $3, 'active')",
        [userId, `${userId}@synthetic.invalid`, "Portfolio Owner"],
      );
      await client.query("INSERT INTO app.centres (id, name, status) VALUES ($1, $2, 'active')", [centreId, "Synthetic Portfolio Centre"]);
      await client.query(
        "INSERT INTO app.centre_memberships (centre_id, user_id, role, status, accepted_at) VALUES ($1, $2, 'owner', 'active', now())",
        [centreId, userId],
      );
      await client.query(
        "INSERT INTO app.saas_subscriptions (centre_id, plan_name, status, started_at, monthly_value) VALUES ($1, 'Synthetic', 'past_due', now(), 1250.00)",
        [centreId],
      );
      await client.query(
        "INSERT INTO app.saas_payment_events (subscription_id, centre_id, amount, status, occurred_at, follow_up_required) SELECT id, $1, 1250.00, 'overdue', now(), true FROM app.saas_subscriptions WHERE centre_id = $1",
        [centreId],
      );
      await client.query(
        "INSERT INTO app.platform_admins (id, email, display_name, role, status) VALUES ($1, $2, 'Synthetic Admin', 'platform_owner', 'active')",
        [adminId, `${adminId}@synthetic.invalid`],
      );

      const repository = createPostgresPlatformAdminRepository(client);
      const centres = await repository.listCentres({ limit: 1 });
      const alerts = await repository.listAlerts({ limit: 1 });
      const detail = await repository.getCentre(centreId, adminId, randomUUID());
      const summary = await repository.getDashboardSummary();

      expect(centres).toHaveLength(1);
      expect(centres[0]).toMatchObject({ centreId, status: "active", subscriptionStatus: "past_due", supportFlag: true });
      expect(Object.keys(centres[0]).sort()).toEqual(["centreId", "lastPaymentAt", "name", "ownerContact", "status", "subscriptionStatus", "supportFlag"].sort());
      expect(alerts[0]).toMatchObject({ centreId, type: "payment_risk", status: "acknowledged" });
      expect(detail?.openAlerts).toHaveLength(1);
      expect(summary).toMatchObject({ activeCentres: 1, pastDueCentres: 1, openAlerts: 1, atRiskCount: 1 });
      await expect(Promise.resolve().then(() => requirePlatformOwner({
        identityId: randomUUID(),
        issuer: "https://issuer.synthetic.invalid",
        subject: "not-owner",
        userId: null,
        platformAdminId: null,
        platformRole: null,
        platformStatus: null,
      }))).rejects.toThrow("The requested resource is unavailable");
      expect((await client.query("SELECT action, outcome FROM app.platform_audit_events WHERE target_centre_id = $1", [centreId])).rows).toEqual([
        { action: "centre.read", outcome: "allowed" },
      ]);
      await client.query("ROLLBACK");
    } finally {
      await client.query("ROLLBACK").catch(() => undefined);
      client.release();
      await pool.end();
    }
  });
});
