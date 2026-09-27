import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { describe, expect, it } from "vitest";
import { createPostgresPeopleRepository } from "../../packages/integrations/src/people/postgres-people-repository";

const databaseUrl = process.env.TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;

suite("PostgreSQL people scope", () => {
  it("keeps people records inside the active centre RLS context", async () => {
    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();
    const centreA = randomUUID();
    const centreB = randomUUID();
    try {
      await client.query("INSERT INTO app.centres (id, name, status) VALUES ($1, $2, 'active'), ($3, $4, 'active')", [centreA, `People A ${centreA}`, centreB, `People B ${centreB}`]);
      const repository = createPostgresPeopleRepository(client);
      const student = await repository.createStudent(centreA, { reference: "S-001", name: "Synthetic Student", enrolmentStatus: "active" });
      await client.query("SET ROLE teacher_helper_test_role");
      await client.query("BEGIN");
      await client.query("SELECT set_config('app.centre_id', $1, true)", [centreA]);
      expect((await client.query("SELECT id FROM app.students WHERE id = $1", [student.id])).rowCount).toBe(1);
      expect((await client.query("SELECT id FROM app.centres WHERE id = $1", [centreB])).rowCount).toBe(0);
      await client.query("ROLLBACK");
    } finally {
      await client.query("ROLLBACK").catch(() => undefined);
      await client.query("RESET ROLE").catch(() => undefined);
      await client.query("DELETE FROM app.centres WHERE id IN ($1, $2)", [centreA, centreB]).catch(() => undefined);
      client.release();
      await pool.end();
    }
  });
});