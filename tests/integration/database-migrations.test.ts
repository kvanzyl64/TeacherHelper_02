import { Pool } from "pg";
import { describe, expect, it } from "vitest";

const databaseUrl = process.env.TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;

suite("database migration catalog", () => {
  it("has a complete, drift-free ledger in the isolated test database", async () => {
    const pool = new Pool({ connectionString: databaseUrl });
    try {
      const result = await pool.query<{ migration_id: string; checksum: string }>(
        "SELECT migration_id, checksum FROM migration_meta.migration_ledger ORDER BY migration_id",
      );
      const migrationIds = result.rows.map((row) => row.migration_id);
      expect(migrationIds).toHaveLength(22);
      expect(migrationIds).toEqual(
        expect.arrayContaining([
          "013_platform_admin_auth",
          "015_managed_identity_and_saas_billing",
          "017_retire_legacy_password_path",
          "021_email_password_auth",
          "022_application_session_clock_validation",
        ]),
      );
      expect(result.rows.every((row) => /^[a-f0-9]{64}$/.test(row.checksum))).toBe(true);
      const tables = await pool.query<{ table_name: string }>(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'app' AND table_name IN ('auth_identities', 'saas_subscriptions', 'platform_audit_events', 'application_sessions', 'password_recovery_requests', 'auth_security_events')",
      );
      expect(tables.rows).toHaveLength(6);
      const credentialColumns = await pool.query<{ column_name: string }>(
        "SELECT column_name FROM information_schema.columns WHERE table_schema = 'app' AND table_name = 'users' AND column_name IN ('password_hash', 'last_password_change_at', 'last_login_at')",
      );
      expect(credentialColumns.rows).toHaveLength(3);
      const passwordHashPrivileges = await pool.query<{
        user_hash_select: boolean;
        admin_hash_select: boolean;
        user_status_select: boolean;
        admin_role_select: boolean;
      }>(`SELECT
        has_column_privilege('teacher_helper_app', 'app.users', 'password_hash', 'SELECT') AS user_hash_select,
        has_column_privilege('teacher_helper_app', 'app.platform_admins', 'password_hash', 'SELECT') AS admin_hash_select,
        has_column_privilege('teacher_helper_app', 'app.users', 'authentication_status', 'SELECT') AS user_status_select,
        has_column_privilege('teacher_helper_app', 'app.platform_admins', 'role', 'SELECT') AS admin_role_select`);
      expect(passwordHashPrivileges.rows[0]).toEqual({
        user_hash_select: false,
        admin_hash_select: false,
        user_status_select: true,
        admin_role_select: true,
      });
    } finally {
      await pool.end();
    }
  });
});
