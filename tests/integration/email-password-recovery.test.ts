import { randomBytes, randomUUID } from "node:crypto";
import { Pool } from "pg";
import { describe, expect, it } from "vitest";
import {
  createPasswordRecoveryRequest,
  completePasswordRecovery,
  isPasswordRecoveryTokenValid,
} from "../../apps/web/lib/auth/recovery";
import { hashPassword, verifyPassword } from "../../apps/web/lib/auth/platform-admin-credentials";
import {
  resolveApplicationSession,
  createApplicationSession,
} from "../../apps/web/lib/auth/session";
import { FakePasswordRecoveryDelivery } from "../../packages/test-support/src/fake-recovery-delivery";
import { digestSecret } from "../../packages/integrations/src/auth/session-provider";

const databaseUrl = process.env.TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;

suite("email/password recovery", () => {
  it("stores only token digests, consumes once, revokes sessions, and expires requests", async () => {
    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();
    const suffix = randomUUID();
    const email = `recovery-${suffix}@example.test`;
    const oldPassword = randomBytes(32).toString("base64url");
    const newPassword = randomBytes(32).toString("base64url");
    const passwordHash = await hashPassword(oldPassword);
    const delivery = new FakePasswordRecoveryDelivery();

    try {
      await client.query("BEGIN");
      const centre = await client.query<{ id: string }>(
        "INSERT INTO app.centres (name, status) VALUES ($1, 'active') RETURNING id",
        [`Recovery ${suffix}`],
      );
      const user = await client.query<{ id: string }>(
        "INSERT INTO app.users (email, display_name, authentication_status, password_hash) VALUES ($1, $2, 'active', $3) RETURNING id",
        [email, "Synthetic Recovery User", passwordHash],
      );
      await client.query(
        "INSERT INTO app.centre_memberships (centre_id, user_id, role, status) VALUES ($1, $2, 'owner', 'active')",
        [centre.rows[0].id, user.rows[0].id],
      );
      const session = await createApplicationSession(client, {
        userId: user.rows[0].id,
        platformAdminId: null,
      });

      const first = await createPasswordRecoveryRequest(client, email, "http://localhost:3000");
      const second = await createPasswordRecoveryRequest(client, email, "http://localhost:3000");
      expect(first).not.toBeNull();
      expect(second).not.toBeNull();
      if (!first || !second) throw new Error("Expected active account recovery requests");
      await delivery.sendRecoveryMessage(first);
      await delivery.sendRecoveryMessage(second);
      expect(delivery.messages).toHaveLength(2);
      expect(delivery.messages[0].to).toBe(email);
      expect(
        await createPasswordRecoveryRequest(
          client,
          `unknown-${suffix}@example.test`,
          "http://localhost:3000",
        ),
      ).toBeNull();

      const firstToken = new URL(first.recoveryUrl).pathname.split("/").at(-1)!;
      const secondToken = new URL(second.recoveryUrl).pathname.split("/").at(-1)!;
      const stored = await client.query<{ token_digest: string; status: string; expires_at: Date }>(
        "SELECT token_digest, status, expires_at FROM app.password_recovery_requests WHERE user_id = $1 ORDER BY expires_at",
        [user.rows[0].id],
      );
      expect(stored.rows[0].token_digest).toBe(digestSecret(firstToken));
      expect(stored.rows[0].token_digest).not.toBe(firstToken);
      expect(stored.rows[0].status).toBe("revoked");
      expect(stored.rows[1].token_digest).toBe(digestSecret(secondToken));
      expect(stored.rows[1].expires_at.getTime()).toBeGreaterThan(Date.now());
      expect(stored.rows[1].expires_at.getTime()).toBeLessThanOrEqual(Date.now() + 30 * 60 * 1000);
      await expect(isPasswordRecoveryTokenValid(client, firstToken)).resolves.toBe(false);
      await expect(isPasswordRecoveryTokenValid(client, secondToken)).resolves.toBe(true);

      await expect(completePasswordRecovery(client, secondToken, newPassword)).resolves.toEqual({
        userId: user.rows[0].id,
        platformAdminId: null,
      });
      await expect(completePasswordRecovery(client, secondToken, newPassword)).resolves.toBeNull();
      await expect(resolveApplicationSession(client, session.token)).resolves.toBeNull();
      const changed = await client.query<{ password_hash: string }>(
        "SELECT password_hash FROM app.users WHERE id = $1",
        [user.rows[0].id],
      );
      await expect(verifyPassword(oldPassword, changed.rows[0].password_hash)).resolves.toBe(false);
      await expect(verifyPassword(newPassword, changed.rows[0].password_hash)).resolves.toBe(true);

      const expiring = await createPasswordRecoveryRequest(client, email, "http://localhost:3000");
      expect(expiring).not.toBeNull();
      if (!expiring) throw new Error("Expected an active account recovery request");
      const expiringToken = new URL(expiring.recoveryUrl).pathname.split("/").at(-1)!;
      await client.query(
        "UPDATE app.password_recovery_requests SET expires_at = now() - interval '1 second' WHERE token_digest = $1",
        [digestSecret(expiringToken)],
      );
      await expect(isPasswordRecoveryTokenValid(client, expiringToken)).resolves.toBe(false);
      const expired = await client.query<{ status: string }>(
        "SELECT status FROM app.password_recovery_requests WHERE token_digest = $1",
        [digestSecret(expiringToken)],
      );
      expect(expired.rows[0].status).toBe("expired");
      await client.query("ROLLBACK");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
      await pool.end();
    }
  });

  it("recovers an active platform owner and revokes the owner session", async () => {
    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();
    const suffix = randomUUID();
    const email = `platform-recovery-${suffix}@example.test`;
    const oldPassword = randomBytes(32).toString("base64url");
    const newPassword = randomBytes(32).toString("base64url");
    const delivery = new FakePasswordRecoveryDelivery();

    try {
      await client.query("BEGIN");
      const admin = await client.query<{ id: string }>(
        "INSERT INTO app.platform_admins (email, display_name, password_hash, role, status) VALUES ($1, $2, $3, 'platform_owner', 'active') RETURNING id",
        [email, "Synthetic Recovery Owner", await hashPassword(oldPassword)],
      );
      const session = await createApplicationSession(client, {
        userId: null,
        platformAdminId: admin.rows[0].id,
      });
      const message = await createPasswordRecoveryRequest(client, email, "http://localhost:3000");
      expect(message).not.toBeNull();
      if (!message) throw new Error("Expected active platform owner recovery request");
      await delivery.sendRecoveryMessage(message);
      const token = new URL(message.recoveryUrl).pathname.split("/").at(-1)!;

      await expect(completePasswordRecovery(client, token, newPassword)).resolves.toEqual({
        userId: null,
        platformAdminId: admin.rows[0].id,
      });
      await expect(resolveApplicationSession(client, session.token)).resolves.toBeNull();
      const changed = await client.query<{ password_hash: string }>(
        "SELECT password_hash FROM app.platform_admins WHERE id = $1",
        [admin.rows[0].id],
      );
      await expect(verifyPassword(oldPassword, changed.rows[0].password_hash)).resolves.toBe(false);
      await expect(verifyPassword(newPassword, changed.rows[0].password_hash)).resolves.toBe(true);
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
