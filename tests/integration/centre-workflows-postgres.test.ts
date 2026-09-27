import { Pool } from "pg";
import { describe, expect, it } from "vitest";
import { createPostgresCentreWorkflowRepository } from "../../packages/integrations/src/centres/postgres-workflow-repository";

const databaseUrl = process.env.TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;

suite("centre workflow persistence", () => {
  it("keeps sessions, invoices, exports, and operations centre-scoped", async () => {
    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();
    try {
      await client.query("SET ROLE teacher_helper_test_role");
      await client.query("BEGIN");
      await client.query("SELECT set_config('app.centre_id', $1, true)", ["10000000-0000-0000-0000-000000000001"]);
      const repository = createPostgresCentreWorkflowRepository(client);
      expect((await repository.listSessions({ centreId: "10000000-0000-0000-0000-000000000001", userId: "10000000-0000-0000-0000-000000000022", role: "tutor" })).length).toBe(1);
      expect((await repository.listInvoices("10000000-0000-0000-0000-000000000001")).length).toBe(1);
      expect((await repository.listExports("10000000-0000-0000-0000-000000000001")).length).toBe(1);
      expect((await client.query("SELECT id FROM app.resources WHERE centre_id = $1", ["10000000-0000-0000-0000-000000000001"])).rowCount).toBe(1);
      expect((await client.query("SELECT id FROM app.payments WHERE centre_id = $1", ["10000000-0000-0000-0000-000000000001"])).rowCount).toBe(1);
      expect((await client.query("SELECT id FROM app.notifications WHERE centre_id = $1", ["10000000-0000-0000-0000-000000000001"])).rowCount).toBe(1);
      expect((await client.query("SELECT id FROM app.access_links WHERE centre_id = $1", ["10000000-0000-0000-0000-000000000001"])).rowCount).toBe(1);
      const operations = await repository.getOperationsSummary("10000000-0000-0000-0000-000000000001");
      expect(operations.scheduledRetentionJobs).toBe(1);
      await client.query("ROLLBACK");
    } finally {
      client.release();
      await pool.end();
    }
  });
});