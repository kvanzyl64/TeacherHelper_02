import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const databaseName = new URL(process.env.DATABASE_URL ?? "postgresql://postgres@127.0.0.1:5432/teacher_helper_dev").pathname.slice(1);
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const migrationsDir = join(root, "migrations");
const psql = process.env.PSQL_BIN ?? (process.platform === "win32" ? "C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" : "psql");
const connectionString = process.env.DATABASE_URL ?? "postgresql://postgres@127.0.0.1:5432/teacher_helper_dev";
const migrations = readdirSync(migrationsDir).filter((name) => /^\d{3}_[a-z0-9_]+\.sql$/.test(name)).sort();

function run(args) {
  const result = spawnSync(psql, ["--dbname", connectionString, "--no-psqlrc", "--set", "ON_ERROR_STOP=1", ...args], { stdio: "inherit", windowsHide: true });
  if (result.error) throw new Error(`Unable to run psql at ${psql}: ${result.error.message}`);
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function query(sql) {
  const result = spawnSync(psql, ["--dbname", connectionString, "--no-psqlrc", "--tuples-only", "--csv", "--command", sql], { encoding: "utf8", windowsHide: true });
  if (result.error) throw new Error(result.error.message);
  if (result.status !== 0) throw new Error(result.stderr.trim());
  return result.stdout.trim();
}

if (process.argv.includes("--baseline")) {
  const baseline = process.argv[process.argv.indexOf("--baseline") + 1]?.split(",").filter(Boolean) ?? [];
  if (databaseName !== "teacher_helper_dev") throw new Error("Baseline recording is allowed only for teacher_helper_dev");
  if (!baseline.length) throw new Error("Usage: node packages/database/scripts/migrate.mjs --baseline 001_centre_access,002_audit_events");
  for (const id of baseline) {
    const file = `${id}.sql`;
    const source = join(migrationsDir, file);
    if (!migrations.includes(file)) throw new Error(`Unknown migration: ${id}`);
    const checksum = createHash("sha256").update(readFileSync(source)).digest("hex");
    query(`INSERT INTO migration_meta.migration_ledger (migration_id, checksum, baseline) VALUES ('${id}', '${checksum}', true) ON CONFLICT (migration_id) DO NOTHING;`);
  }
  process.exit(0);
}

const ledgerExists = query("SELECT to_regclass('migration_meta.migration_ledger') IS NOT NULL;") === "t";
const appExists = query("SELECT to_regnamespace('app') IS NOT NULL;") === "t";
if (!ledgerExists && appExists) throw new Error("Existing app schema has no ledger. Review the catalog, apply 014_migration_ledger.sql, then record a verified baseline before migrating.");
if (!ledgerExists) {
  run(["--file", join(migrationsDir, "014_migration_ledger.sql")]);
}
if (!appExists) run(["--command", "CREATE SCHEMA IF NOT EXISTS app;"]);

const applied = new Set(query("SELECT migration_id FROM migration_meta.migration_ledger;").split(/\r?\n/).filter(Boolean));
for (const migration of migrations) {
  const id = migration.slice(0, -4);
  if (applied.has(id)) continue;
  const checksum = createHash("sha256").update(readFileSync(join(migrationsDir, migration))).digest("hex");
  console.log(`Applying ${id}`);
  run(["--file", join(migrationsDir, migration)]);
  query(`INSERT INTO migration_meta.migration_ledger (migration_id, checksum) VALUES ('${id}', '${checksum}') ON CONFLICT (migration_id) DO NOTHING;`);
}