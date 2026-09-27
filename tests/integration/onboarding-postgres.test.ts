import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { describe, expect, it } from "vitest";
import { OnboardingService } from "../../packages/domain/src/centre/onboarding-service";
import { createPostgresOnboardingRepository } from "../../packages/integrations/src/centres/postgres-onboarding-repository";

const databaseUrl = process.env.TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;

suite("PostgreSQL centre onboarding", () => {
  it("persists the centre workflow and rolls it back as one unit", async () => {
    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();
    const centreId = randomUUID();
    const userId = randomUUID();
    try {
      await client.query("INSERT INTO app.users (id, email, display_name, authentication_status) VALUES ($1, $2, $3, 'active')", [userId, `${userId}@synthetic.invalid`, "Synthetic Owner"]);
      await client.query("BEGIN");
      const service = new OnboardingService(createPostgresOnboardingRepository(client));
      const created = await service.createCentre({
        actorRole: "owner",
        actorUserId: userId,
        centre: { name: `Atomic Centre ${centreId}`, timezone: "Africa/Johannesburg", plan: "trial" },
      });
      expect(created.status).toBe("trial");
      const persisted = await client.query("SELECT id FROM app.centres WHERE id = $1", [created.id]);
      expect(persisted.rowCount).toBe(1);
      expect((await client.query("SELECT centre_id FROM app.centre_memberships WHERE centre_id = $1 AND user_id = $2", [created.id, userId])).rowCount).toBe(1);
      expect((await client.query("SELECT centre_id, status FROM app.saas_subscriptions WHERE centre_id = $1", [created.id])).rows[0].status).toBe("trial");
      expect((await client.query("SELECT event_type FROM app.audit_events WHERE centre_id = $1", [created.id])).rows[0].event_type).toBe("centre.created");
      await client.query("ROLLBACK");
      expect((await client.query("SELECT id FROM app.centres WHERE id = $1", [created.id])).rowCount).toBe(0);
    } finally {
      await client.query("ROLLBACK").catch(() => undefined);
      await client.query("DELETE FROM app.users WHERE id = $1", [userId]).catch(() => undefined);
      client.release();
      await pool.end();
    }
  });
});