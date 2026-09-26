import { Pool, type PoolClient } from "pg";
import { assertSafeDatabaseUrl } from "./database-url";

export function createTestDatabasePool(connectionString = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL): Pool {
  const url = assertSafeDatabaseUrl(connectionString, "test");
  return new Pool({ connectionString: url.toString() });
}

export async function resetTestDatabase(pool: Pick<Pool, "connect">, connectionString = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL): Promise<void> {
  const url = assertSafeDatabaseUrl(connectionString, "test");
  if (url.pathname !== "/teacher_helper_test") throw new Error("Test cleanup may target only teacher_helper_test");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const tables = await client.query<{ tablename: string }>("SELECT tablename FROM pg_tables WHERE schemaname = 'app' AND tablename <> '_bootstrap_marker'");
    for (const table of tables.rows) await client.query(`TRUNCATE TABLE app."${table.tablename.replaceAll('"', '""')}" RESTART IDENTITY CASCADE`);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function withTestClient<T>(pool: Pick<Pool, "connect">, run: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    return await run(client);
  } finally {
    client.release();
  }
}