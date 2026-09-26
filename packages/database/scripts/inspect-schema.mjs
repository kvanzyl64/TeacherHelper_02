import { spawnSync } from "node:child_process";

const connectionString = process.env.DATABASE_URL ?? "postgresql://postgres@127.0.0.1:5432/teacher_helper_dev";
const psql = process.env.PSQL_BIN ?? (process.platform === "win32" ? "C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" : "psql");
const sql = `
SELECT 'tables' AS section, table_schema || '.' || table_name AS value
FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
UNION ALL
SELECT 'rls', n.nspname || '.' || c.relname || ': enabled=' || c.relrowsecurity || ', forced=' || c.relforcerowsecurity
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r' AND n.nspname NOT IN ('pg_catalog', 'information_schema')
UNION ALL
SELECT 'policy', schemaname || '.' || tablename || ':' || policyname FROM pg_policies
UNION ALL
SELECT 'grant', table_schema || '.' || table_name || ':' || grantee || ':' || privilege_type
FROM information_schema.role_table_grants WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY section, value;
`;

const result = spawnSync(psql, ["--dbname", connectionString, "--no-psqlrc", "--tuples-only", "--csv", "--command", sql], {
  stdio: "inherit",
  windowsHide: true,
});

if (result.error) throw new Error(`Unable to run psql at ${psql}: ${result.error.message}`);
if (result.status !== 0) process.exit(result.status ?? 1);