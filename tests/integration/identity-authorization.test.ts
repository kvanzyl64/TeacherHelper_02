import { Pool } from "pg";
import { describe, expect, it } from "vitest";
import { resolveIdentity } from "../../apps/web/lib/auth/identity";
import { requireCentreMembership, requirePlatformOwner } from "../../apps/web/lib/auth/dal";
import { seedSyntheticTenant, syntheticTenantIds } from "../../packages/test-support/src";

const databaseUrl = process.env.TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;

suite("managed identity and authorization", () => {
  it("resolves a centre identity and denies an unmapped identity", async () => {
    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();
    try {
      const centreId = "00000000-0000-0000-0000-000000000101";
      const userId = "00000000-0000-0000-0000-000000000111";
      const identityId = "00000000-0000-0000-0000-000000000121";
      await seedSyntheticTenant(client, { centreId, userId, identityId, issuer: "https://identity.test", subject: "valid" });
      const identity = await resolveIdentity(client, { iss: "https://identity.test", sub: "valid" });
      expect(identity.userId).toBe(userId);
      await expect(resolveIdentity(client, { iss: "https://identity.test", sub: "missing" })).rejects.toThrow("unavailable");
      await expect(requireCentreMembership(client, identity, syntheticTenantIds.centreB)).rejects.toThrow("unavailable");
    } finally {
      client.release();
      await pool.end();
    }
  });

  it("requires an active platform-owner mapping", () => {
    expect(() => requirePlatformOwner({ identityId: "id", issuer: "issuer", subject: "subject", userId: null, platformAdminId: null, platformRole: null, platformStatus: null })).toThrow("unavailable");
  });

  it("rejects a disabled identity and a tutor outside an owner capability", async () => {
    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();
    try {
      const centreId = "00000000-0000-0000-0000-000000000102";
      const userId = "00000000-0000-0000-0000-000000000112";
      const identityId = "00000000-0000-0000-0000-000000000122";
      await seedSyntheticTenant(client, { centreId, userId, identityId, issuer: "https://identity.test", subject: "tutor", role: "tutor" });
      const identity = await resolveIdentity(client, { iss: "https://identity.test", sub: "tutor" });
      await expect(requireCentreMembership(client, identity, centreId, ["owner"])).rejects.toThrow("unavailable");
      await client.query("UPDATE app.auth_identities SET status = 'disabled' WHERE id = $1", [identityId]);
      await expect(resolveIdentity(client, { iss: "https://identity.test", sub: "tutor" })).rejects.toThrow("unavailable");
    } finally {
      client.release();
      await pool.end();
    }
  });
});