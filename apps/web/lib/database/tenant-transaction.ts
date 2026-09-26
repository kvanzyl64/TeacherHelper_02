import type { Pool, PoolClient } from "pg";

export async function withTenantTransaction<T>(input: {
  pool: Pick<Pool, "connect">;
  centreId: string;
  userId: string;
  run: (client: PoolClient) => Promise<T>;
}): Promise<T> {
  const client = await input.pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config($1, $2, true)", ["app.centre_id", input.centreId]);
    await client.query("SELECT set_config($1, $2, true)", ["app.user_id", input.userId]);
    const result = await input.run(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}