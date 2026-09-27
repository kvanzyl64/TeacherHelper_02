import { Pool } from "pg";
import { describe, expect, it } from "vitest";

const databaseUrl = process.env.TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;

suite("people consent and tutor boundaries", () => {
  it("exposes consent and tutor assignment only inside the active centre", async () => {
    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();
    try {
      await client.query("SET ROLE teacher_helper_test_role");
      await client.query("BEGIN");
      await client.query("SELECT set_config('app.centre_id', $1, true)", ["10000000-0000-0000-0000-000000000001"]);
      expect((await client.query("SELECT id FROM app.consent_records WHERE student_id = $1", ["10000000-0000-0000-0000-000000000101"])).rowCount).toBe(1);
      expect((await client.query("SELECT id FROM app.tutor_assignments WHERE student_id = $1", ["10000000-0000-0000-0000-000000000101"])).rowCount).toBe(1);
      expect((await client.query("SELECT id FROM app.consent_records WHERE centre_id = $1", ["10000000-0000-0000-0000-000000000002"])).rowCount).toBe(0);
      await client.query("ROLLBACK");
    } finally {
      client.release();
      await pool.end();
    }
  });
});