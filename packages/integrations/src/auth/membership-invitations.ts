import type { MembershipInvitation } from "@teacher-helper/domain";

type QueryClient = {
  query<T extends Record<string, unknown> = Record<string, unknown>>(text: string, values?: readonly unknown[]): Promise<{ rows: T[] }>;
};

export function createPostgresMembershipInvitationRepository(client: QueryClient) {
  return {
    async insert(invitation: MembershipInvitation): Promise<MembershipInvitation> {
      await client.query(
        `INSERT INTO app.membership_invites
          (id, centre_id, email, role, status, token_digest, invited_at, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [invitation.id, invitation.centreId, invitation.email, invitation.role, invitation.status, invitation.tokenDigest, invitation.invitedAt, invitation.expiresAt],
      );
      return invitation;
    },

    async findByDigest(centreId: string, tokenDigest: string): Promise<MembershipInvitation | null> {
      const result = await client.query<InvitationRow>(
        `SELECT id, centre_id, email, role, status, token_digest, invited_at, expires_at, accepted_at, revoked_at
           FROM app.membership_invites
          WHERE centre_id = $1 AND token_digest = $2`,
        [centreId, tokenDigest],
      );
      return result.rows[0] ? mapInvitation(result.rows[0]) : null;
    },
  };
}

type InvitationRow = { id: string; centre_id: string; email: string; role: MembershipInvitation["role"]; status: MembershipInvitation["status"]; token_digest: string; invited_at: Date; expires_at: Date; accepted_at: Date | null; revoked_at: Date | null };
function mapInvitation(row: InvitationRow): MembershipInvitation { return { id: row.id, centreId: row.centre_id, email: row.email, role: row.role, status: row.status, tokenDigest: row.token_digest, invitedAt: row.invited_at, expiresAt: row.expires_at, acceptedAt: row.accepted_at ?? undefined, revokedAt: row.revoked_at ?? undefined }; }

export type AcceptedInvitation = { centreId: string; role: MembershipInvitation["role"] };

export function createPostgresInvitationAcceptanceRepository(client: QueryClient) {
  return {
    async accept(input: { tokenDigest: string; issuer: string; subject: string; email: string; displayName: string }): Promise<AcceptedInvitation | null> {
      const result = await client.query<{ centre_id: string; role: MembershipInvitation["role"] }>(
        "SELECT accepted_centre_id AS centre_id, accepted_role AS role FROM app.accept_membership_invite($1, $2, $3, $4, $5)",
        [input.tokenDigest, input.issuer, input.subject, input.email, input.displayName],
      );
      const row = result.rows[0];
      return row ? { centreId: row.centre_id, role: row.role } : null;
    },
  };
}