import { createHash, randomBytes } from "node:crypto";
import { hashPlatformAdminPassword } from "../../apps/web/lib/auth/platform-admin-credentials";

export async function createAuthFixtures() {
  const password = randomBytes(32).toString("base64url");
  const passwordHash = await hashPlatformAdminPassword(password);
  const rawSessionToken = randomBytes(32).toString("base64url");

  return {
    testPassword: password,
    validCentreAccount: {
      id: "10000000-0000-4000-8000-000000000001",
      email: "centre-owner@example.test",
      passwordHash,
      authenticationStatus: "active" as const,
      membership: {
        centreId: "20000000-0000-4000-8000-000000000001",
        role: "owner" as const,
        status: "active" as const,
      },
    },
    platformOwnerAccount: {
      id: "30000000-0000-4000-8000-000000000001",
      email: "platform-owner@example.test",
      passwordHash,
      role: "platform_owner" as const,
      status: "active" as const,
    },
    inactiveAccount: {
      id: "10000000-0000-4000-8000-000000000002",
      email: "inactive-user@example.test",
      passwordHash,
      authenticationStatus: "revoked" as const,
    },
    unknownEmail: "unknown-user@example.test",
    revokedSession: {
      accountId: "10000000-0000-4000-8000-000000000001",
      tokenHash: createHash("sha256").update(rawSessionToken).digest("hex"),
      revokedAt: "2026-01-01T00:00:00.000Z",
    },
  };
}
