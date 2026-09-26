import { describe, expect, it } from "vitest";
import {
  hashPlatformAdminPassword,
  verifyPlatformAdminPassword,
} from "./platform-admin-credentials";

describe("platform admin credentials", () => {
  it("stores a salted hash and verifies only the matching password", async () => {
    const password = "local-admin-test-password";
    const passwordHash = await hashPlatformAdminPassword(password);

    expect(passwordHash).not.toContain(password);
    expect(await verifyPlatformAdminPassword(password, passwordHash)).toBe(true);
    expect(await verifyPlatformAdminPassword("incorrect-password", passwordHash)).toBe(false);
  });

  it("rejects malformed password hashes", async () => {
    await expect(verifyPlatformAdminPassword("any-password", "invalid")).resolves.toBe(false);
  });
});
