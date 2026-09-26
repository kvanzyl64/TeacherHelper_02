import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const migrationsDir = join(root, "migrations");
const connectionString = process.env.DATABASE_URL ?? "postgresql://postgres@127.0.0.1:5432/teacher_helper_dev";
const psql = process.env.PSQL_BIN ?? (process.platform === "win32" ? "C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe" : "psql");
const migrations = readdirSync(migrationsDir).filter((name) => /^\d{3}_[a-z0-9_]+\.sql$/.test(name)).sort();

function query(sql) {
  const result = spawnSync(psql, ["--dbname", connectionString, "--no-psqlrc", "--tuples-only", "--csv", "--command", sql], { encoding: "utf8", windowsHide: true });
  if (result.error) throw new Error(`Unable to run psql at ${psql}: ${result.error.message}`);
  if (result.status !== 0) throw new Error(result.stderr.trim() || `psql exited with ${result.status}`);
  return result.stdout.trim();
}

const ledgerExists = query("SELECT to_regclass('migration_meta.migration_ledger') IS NOT NULL;") === "t";
const applied = ledgerExists
  ? new Map(query("SELECT migration_id, checksum, baseline FROM migration_meta.migration_ledger ORDER BY migration_id;").split(/\r?\n/).filter(Boolean).map((line) => {
      const [migrationId, checksum, baseline] = line.split(",");
      return [migrationId, { checksum, baseline }];
    }))
  : new Map();

console.log("migration_id,status,checksum,baseline");
for (const migration of migrations) {
  const checksum = createHash("sha256").update(readFileSync(join(migrationsDir, migration))).digest("hex");
  const row = applied.get(migration.slice(0, -4));
  if (!row) console.log(`${migration.slice(0, -4)},pending,${checksum},false`);
  else if (row.checksum !== checksum) console.log(`${migration.slice(0, -4)},DRIFT,${checksum},${row.baseline}`);
  else console.log(`${migration.slice(0, -4)},applied,${checksum},${row.baseline}`);
}

if (!ledgerExists) console.error("No migration ledger exists. Existing databases require reviewed baseline recording before migration.");