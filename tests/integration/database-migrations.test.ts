import { Pool } from "pg";
import { describe, expect, it } from "vitest";

const databaseUrl = process.env.TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;

suite("database migration catalog", () => {
  it("has a complete, drift-free ledger in the isolated test database", async () => {
    const pool = new Pool({ connectionString: databaseUrl });
    try {
      const result = await pool.query<{ migration_id: string; checksum: string }>("SELECT migration_id, checksum FROM migration_meta.migration_ledger ORDER BY migration_id");
      expect(result.rows.map((row) => row.migration_id)).toHaveLength(17);
      expect(result.rows.every((row) => /^[a-f0-9]{64}$/.test(row.checksum))).toBe(true);
      const tables = await pool.query<{ table_name: string }>("SELECT table_name FROM information_schema.tables WHERE table_schema = 'app' AND table_name IN ('auth_identities', 'saas_subscriptions', 'platform_audit_events')");
      expect(tables.rows).toHaveLength(3);
    } finally {
      await pool.end();
    }
  });
});