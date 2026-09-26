import { Pool } from "pg";
import { describe, expect, it } from "vitest";
import { seedSyntheticTenant, syntheticTenantIds } from "../../packages/test-support/src";

const databaseUrl = process.env.TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;

suite("tenant RLS and transaction context", () => {
  it("allows the active centre and denies a different centre on a reused client", async () => {
    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();
    try {
      await seedSyntheticTenant(client, { centreId: syntheticTenantIds.centreA, userId: syntheticTenantIds.userA, identityId: syntheticTenantIds.identityA, issuer: "https://synthetic.test", subject: "a" });
      await seedSyntheticTenant(client, { centreId: syntheticTenantIds.centreB, userId: syntheticTenantIds.userB, identityId: syntheticTenantIds.identityB, issuer: "https://synthetic.test", subject: "b" });
      await client.query("SET ROLE teacher_helper_test_role");
      await client.query("BEGIN");
      await client.query("SELECT set_config('app.centre_id', $1, true)", [syntheticTenantIds.centreA]);
      expect((await client.query("SELECT id FROM app.centres")).rows.map((row) => row.id)).toEqual([syntheticTenantIds.centreA]);
      await client.query("ROLLBACK");
      await client.query("BEGIN");
      await client.query("SELECT set_config('app.centre_id', $1, true)", [syntheticTenantIds.centreB]);
      expect((await client.query("SELECT id FROM app.centres")).rows.map((row) => row.id)).toEqual([syntheticTenantIds.centreB]);
      await client.query("ROLLBACK");
    } finally {
      client.release();
      await pool.end();
    }
  });
});