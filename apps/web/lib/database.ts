import { Pool } from "pg";

const globalForDatabase = globalThis as typeof globalThis & { teacherHelperPool?: Pool };

export function getDatabasePool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required for platform admin authentication");
  }

  globalForDatabase.teacherHelperPool ??= new Pool({ connectionString });
  return globalForDatabase.teacherHelperPool;
}
