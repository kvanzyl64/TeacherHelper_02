import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  hashPassword,
  verifyPassword,
  hashPlatformAdminPassword,
  verifyPlatformAdminPassword,
} from "./platform-admin-credentials";

describe("platform admin credentials", () => {
  it("stores a salted hash and verifies only the matching password", async () => {
    const password = randomBytes(32).toString("base64url");
    const incorrectPassword = randomBytes(32).toString("base64url");
    const passwordHash = await hashPlatformAdminPassword(password);

    expect(passwordHash).not.toContain(password);
    expect(await verifyPlatformAdminPassword(password, passwordHash)).toBe(true);
    expect(await verifyPlatformAdminPassword(incorrectPassword, passwordHash)).toBe(false);
  });

  it("rejects malformed password hashes", async () => {
    const password = randomBytes(32).toString("base64url");
    await expect(verifyPlatformAdminPassword(password, "invalid")).resolves.toBe(false);
  });

  it("exposes the same salted scrypt verifier through the shared credential boundary", async () => {
    const password = `${randomBytes(32).toString("base64url")}CaseSensitive`;
    const passwordHash = await hashPassword(password);

    expect(await verifyPassword(password, passwordHash)).toBe(true);
    expect(await verifyPassword(password.toLowerCase(), passwordHash)).toBe(false);
  });
});
