const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);

export type DatabaseUrlPurpose = "test" | "development" | "reset";

export function assertSafeDatabaseUrl(value: string | undefined, purpose: DatabaseUrlPurpose): URL {
  if (!value) throw new Error("DATABASE_URL is required");

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL URL");
  }

  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error("DATABASE_URL must use the postgres or postgresql scheme");
  }
  if (!LOCAL_HOSTS.has(url.hostname)) {
    throw new Error("DATABASE_URL must point to a local PostgreSQL host");
  }

  const databaseName = decodeURIComponent(url.pathname.replace(/^\//, ""));
  if (purpose === "test" && databaseName !== "teacher_helper_test") {
    throw new Error("Test DATABASE_URL must target teacher_helper_test");
  }
  if (purpose === "reset" && databaseName === "teacher_helper_dev") {
    throw new Error("Reset operations against teacher_helper_dev are never allowed");
  }
  if (/(staging|production|prod)/i.test(`${url.hostname}/${databaseName}`)) {
    throw new Error("DATABASE_URL must not target staging or production");
  }

  return url;
}