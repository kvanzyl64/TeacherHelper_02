import { Pool } from "pg";
import { describe, expect, it } from "vitest";
import { createPostgresAccessLinkRepository } from "../../packages/integrations/src/guardian-links/postgres-access-link-repository";
import { createPostgresInvitationAcceptanceRepository } from "../../packages/integrations/src/auth/membership-invitations";

const databaseUrl = process.env.TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;

// Covers the two SECURITY DEFINER token flows added in migration 020. Both run inside a
// transaction that is rolled back so the synthetic seed stays intact between runs.

suite("guardian link resolution", () => {
  it("returns exactly the approved session for a valid token and denies unknown tokens", async () => {
    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const repository = createPostgresAccessLinkRepository(client);

      const view = await repository.openLink("synthetic-access-link-digest");
      expect(view?.recordType).toBe("session");
      expect(view?.session?.subject).toBe("Mathematics");
      expect(view?.session?.topics).toContain("fractions");

      const unknown = await repository.openLink("does-not-exist-digest");
      expect(unknown).toBeNull();
      await client.query("ROLLBACK");
    } finally {
      await client.query("ROLLBACK").catch(() => undefined);
      client.release();
      await pool.end();
    }
  });

  it("denies a link once consent is withdrawn", async () => {
    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("UPDATE app.consent_records SET withdrawn_at = now() WHERE guardian_id = '10000000-0000-0000-0000-000000000201' AND student_id = '10000000-0000-0000-0000-000000000101'");
      const view = await createPostgresAccessLinkRepository(client).openLink("synthetic-access-link-digest");
      expect(view).toBeNull();
      await client.query("ROLLBACK");
    } finally {
      await client.query("ROLLBACK").catch(() => undefined);
      client.release();
      await pool.end();
    }
  });
});

suite("membership invite acceptance", () => {
  it("provisions a centre membership only in the invite centre and denies unknown invites", async () => {
    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const repository = createPostgresInvitationAcceptanceRepository(client);

      const accepted = await repository.accept({
        tokenDigest: "synthetic-invite-digest",
        issuer: "https://teacher-helper.test.auth0.com/",
        subject: "invited-tutor",
        email: "new.tutor@brightpath.test",
        displayName: "Invited Tutor",
      });
      expect(accepted?.centreId).toBe("10000000-0000-0000-0000-000000000001");
      expect(accepted?.role).toBe("tutor");

      const membership = await client.query(
        "SELECT m.status FROM app.centre_memberships m JOIN app.users u ON u.id = m.user_id JOIN app.auth_identities i ON i.id = u.identity_id WHERE i.subject = 'invited-tutor' AND m.centre_id = '10000000-0000-0000-0000-000000000001'",
      );
      expect(membership.rowCount).toBe(1);

      const unknown = await repository.accept({
        tokenDigest: "no-such-invite",
        issuer: "https://teacher-helper.test.auth0.com/",
        subject: "invited-tutor",
        email: "new.tutor@brightpath.test",
        displayName: "Invited Tutor",
      });
      expect(unknown).toBeNull();
      await client.query("ROLLBACK");
    } finally {
      await client.query("ROLLBACK").catch(() => undefined);
      client.release();
      await pool.end();
    }
  });
});
