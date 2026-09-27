import { randomBytes, randomUUID } from "node:crypto";
import { Pool } from "pg";
import { describe, expect, it } from "vitest";
import { lookupAccountByEmail } from "../../apps/web/lib/auth/account";
import {
  createApplicationSession,
  resolveApplicationSession,
  revokeApplicationSession,
} from "../../apps/web/lib/auth/session";
import { requireCentreMembership } from "../../apps/web/lib/auth/dal";
import { hashPassword } from "../../apps/web/lib/auth/platform-admin-credentials";

const databaseUrl = process.env.TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;

suite("email and password authentication foundation", () => {
  it("resolves account status and roles, persists only session digests, and enforces revocation", async () => {
    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();
    const suffix = randomUUID();
    const testPassword = randomBytes(32).toString("base64url");
    try {
      await client.query("BEGIN");
      const centre = await client.query<{ id: string }>(
        "INSERT INTO app.centres (name, status) VALUES ($1, 'active') RETURNING id",
        [`Auth integration ${suffix}`],
      );
      const centreId = centre.rows[0].id;
      const user = await client.query<{ id: string }>(
        "INSERT INTO app.users (email, display_name, authentication_status, password_hash) VALUES ($1, $2, 'active', $3) RETURNING id",
        [`auth-${suffix}@example.test`, "Synthetic Auth User", await hashPassword(testPassword)],
      );
      const userId = user.rows[0].id;
      await client.query(
        "INSERT INTO app.centre_memberships (centre_id, user_id, role, status) VALUES ($1, $2, 'owner', 'active')",
        [centreId, userId],
      );
      const account = await lookupAccountByEmail(client, `auth-${suffix}@example.test`);
      expect(account).toMatchObject({
        kind: "centre",
        id: userId,
        memberships: [{ centreId, role: "owner" }],
      });

      const created = await createApplicationSession(client, { userId, platformAdminId: null });
      const stored = await client.query<{ token_digest: string; expires_at: Date }>(
        "SELECT token_digest, expires_at FROM app.application_sessions WHERE id = $1",
        [created.sessionId],
      );
      expect(stored.rows[0].token_digest).not.toBe(created.token);
      expect(stored.rows[0].token_digest).toMatch(/^[a-f0-9]{64}$/);
      expect(stored.rows[0].expires_at.getTime()).toBeGreaterThan(Date.now());

      const resolved = await resolveApplicationSession(client, created.token);
      expect(resolved).toMatchObject({ userId, memberships: [{ centreId, role: "owner" }] });
      await expect(
        requireCentreMembership(
          client,
          {
            identityId: null,
            issuer: null,
            subject: null,
            userId,
            platformAdminId: null,
            platformRole: null,
            platformStatus: null,
          },
          centreId,
        ),
      ).resolves.toMatchObject({ centreId, userId, role: "owner" });
      await expect(
        requireCentreMembership(
          client,
          {
            identityId: null,
            issuer: null,
            subject: null,
            userId,
            platformAdminId: null,
            platformRole: null,
            platformStatus: null,
          },
          randomUUID(),
        ),
      ).rejects.toThrow("unavailable");
      await expect(
        requireCentreMembership(
          client,
          {
            identityId: null,
            issuer: null,
            subject: null,
            userId,
            platformAdminId: null,
            platformRole: null,
            platformStatus: null,
          },
          centreId,
          ["admin"],
        ),
      ).rejects.toThrow("unavailable");

      await client.query("UPDATE app.users SET authentication_status = 'revoked' WHERE id = $1", [
        userId,
      ]);
      await expect(resolveApplicationSession(client, created.token)).resolves.toBeNull();
      await client.query("UPDATE app.users SET authentication_status = 'active' WHERE id = $1", [
        userId,
      ]);
      await expect(revokeApplicationSession(client, created.token)).resolves.toBe(true);
      await expect(resolveApplicationSession(client, created.token)).resolves.toBeNull();
      await client.query("ROLLBACK");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
      await pool.end();
    }
  });

  it("rejects inactive platform administrators and expired application sessions", async () => {
    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();
    const suffix = randomUUID();
    const testPassword = randomBytes(32).toString("base64url");
    try {
      await client.query("BEGIN");
      await client.query(
        "INSERT INTO app.platform_admins (email, display_name, password_hash, role, status) VALUES ($1, $2, $3, 'platform_owner', 'suspended')",
        [
          `suspended-${suffix}@example.test`,
          "Synthetic Suspended Admin",
          await hashPassword(testPassword),
        ],
      );
      await expect(
        lookupAccountByEmail(client, `suspended-${suffix}@example.test`),
      ).resolves.toBeNull();
      const activeAdmin = await client.query<{ id: string }>(
        "INSERT INTO app.platform_admins (email, display_name, password_hash, role, status) VALUES ($1, $2, $3, 'platform_owner', 'active') RETURNING id",
        [
          `active-${suffix}@example.test`,
          "Synthetic Platform Owner",
          await hashPassword(testPassword),
        ],
      );
      await expect(
        lookupAccountByEmail(client, `active-${suffix}@example.test`),
      ).resolves.toMatchObject({
        kind: "platform_admin",
        id: activeAdmin.rows[0].id,
        role: "platform_owner",
      });
      const activeAdminSession = await createApplicationSession(client, {
        userId: null,
        platformAdminId: activeAdmin.rows[0].id,
      });
      await expect(
        resolveApplicationSession(client, activeAdminSession.token),
      ).resolves.toMatchObject({
        userId: null,
        platformAdminId: activeAdmin.rows[0].id,
        platformRole: "platform_owner",
        platformStatus: "active",
      });

      const expiredDigest = randomUUID().replaceAll("-", "");
      const centre = await client.query<{ id: string }>(
        "INSERT INTO app.centres (name, status) VALUES ($1, 'active') RETURNING id",
        [`Expired Session ${suffix}`],
      );
      const user = await client.query<{ id: string }>(
        "INSERT INTO app.users (email, display_name, authentication_status) VALUES ($1, $2, 'active') RETURNING id",
        [`expired-${suffix}@example.test`, "Synthetic Expired User"],
      );
      await client.query(
        "INSERT INTO app.centre_memberships (centre_id, user_id, role, status) VALUES ($1, $2, 'tutor', 'active')",
        [centre.rows[0].id, user.rows[0].id],
      );
      await client.query(
        "INSERT INTO app.application_sessions (user_id, token_digest, expires_at) VALUES ($1, $2, now() - interval '1 second')",
        [user.rows[0].id, expiredDigest],
      );
      await expect(resolveApplicationSession(client, expiredDigest)).resolves.toBeNull();
      await client.query("ROLLBACK");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
      await pool.end();
    }
  });
});
