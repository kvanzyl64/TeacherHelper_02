export const integrationDatabaseUrl = process.env.DATABASE_URL ?? "";

export function isLocalDatabaseUrl(databaseUrl: string): boolean {
  return !/prod|staging/i.test(databaseUrl) && /teacher_helper_dev|localhost|127\.0\.0\.1/i.test(databaseUrl);
}

if (integrationDatabaseUrl && !isLocalDatabaseUrl(integrationDatabaseUrl)) {
  throw new Error("Integration tests must not connect to staging or production databases");
}