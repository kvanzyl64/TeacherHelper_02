import { Pool } from "pg";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) args.set(process.argv[index], process.argv[index + 1]);
if (process.argv.some((argument) => /password|passwd/i.test(argument))) throw new Error("Password arguments are not accepted; use the managed OIDC provider");

const issuer = args.get("--issuer");
const subject = args.get("--subject");
const email = args.get("--email");
const displayName = args.get("--display-name");
if (!issuer || !subject || !email || !displayName) throw new Error("Usage: provision-platform-owner.mjs --issuer <issuer> --subject <subject> --email <email> --display-name <name> [--confirm-duplicate true]");

const url = new URL(process.env.DATABASE_URL ?? "");
if (!["127.0.0.1", "localhost", "::1"].includes(url.hostname) || !url.pathname.endsWith("teacher_helper_dev")) throw new Error("Owner bootstrap is restricted to local teacher_helper_dev");

const pool = new Pool({ connectionString: url.toString() });
const client = await pool.connect();
try {
  await client.query("BEGIN");
  const identity = await client.query("SELECT id FROM app.auth_identities WHERE issuer = $1 AND subject = $2 AND status = 'active'", [issuer, subject]);
  if (!identity.rows[0]) throw new Error("The managed OIDC identity must already exist and be active");
  const owners = await client.query("SELECT id FROM app.platform_admins WHERE role = 'platform_owner' AND status = 'active' FOR UPDATE");
  const existing = await client.query("SELECT id FROM app.platform_admins WHERE identity_id = $1 FOR UPDATE", [identity.rows[0].id]);
  if (owners.rowCount && !existing.rowCount && args.get("--confirm-duplicate") !== "true") throw new Error("An active platform owner already exists; pass --confirm-duplicate true to explicitly replace/activate another mapping");
  const admin = existing.rows[0] ?? (await client.query("INSERT INTO app.platform_admins (identity_id, email, display_name, password_hash, role, status) VALUES ($1, $2, $3, NULL, 'platform_owner', 'active') RETURNING id", [identity.rows[0].id, email, displayName])).rows[0];
  if (existing.rows[0]) await client.query("UPDATE app.platform_admins SET email = $2, display_name = $3, role = 'platform_owner', status = 'active', updated_at = now() WHERE id = $1", [admin.id, email, displayName]);
  await client.query("INSERT INTO app.platform_audit_events (actor_admin_id, action, outcome, request_id, metadata) VALUES ($1, 'owner_bootstrap', 'allowed', $2, $3)", [admin.id, `bootstrap-${Date.now()}`, JSON.stringify({ issuer, subject })]);
  await client.query("COMMIT");
  console.log(`Provisioned platform owner mapping ${admin.id}`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}