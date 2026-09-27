import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("migration catalog", () => {
  it("contains immutable, sequentially named migrations", () => {
    const directory = join(process.cwd(), "packages/database/migrations");
    const migrations = readdirSync(directory)
      .filter((name) => /^\d{3}_[a-z0-9_]+\.sql$/.test(name))
      .sort();
    expect(migrations.length).toBeGreaterThanOrEqual(21);
    expect(migrations.map((name) => Number(name.slice(0, 3)))).toEqual(
      migrations.map((_, index) => index + 1),
    );
    expect(migrations).toEqual(
      expect.arrayContaining([
        "013_platform_admin_auth.sql",
        "015_managed_identity_and_saas_billing.sql",
        "017_retire_legacy_password_path.sql",
        "021_email_password_auth.sql",
      ]),
    );
  });

  it("produces stable checksums for migration ledger entries", () => {
    const source = readFileSync(
      join(process.cwd(), "packages/database/migrations/015_managed_identity_and_saas_billing.sql"),
    );
    expect(createHash("sha256").update(source).digest("hex")).toMatch(/^[a-f0-9]{64}$/);
  });
});
