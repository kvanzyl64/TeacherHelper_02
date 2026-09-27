type QueryClient = {
  query<T extends Record<string, unknown> = Record<string, unknown>>(text: string, values?: readonly unknown[]): Promise<{ rows: T[]; rowCount: number | null }>;
};

export type GuardianLinkRecordType = "session" | "resource" | "invoice" | "receipt";

export type GuardianLinkSession = { subject: string; topics: string[]; attendance: string; notes?: string; homework?: string; nextFocus?: string };

export type GuardianLinkView = { recordType: GuardianLinkRecordType; session?: GuardianLinkSession };

export function createPostgresAccessLinkRepository(client: QueryClient) {
  return {
    async openLink(tokenDigest: string): Promise<GuardianLinkView | null> {
      const resolved = await client.query<ResolvedRow>(
        "SELECT centre_id, record_type, record_id FROM app.resolve_guardian_link($1)",
        [tokenDigest],
      );
      const link = resolved.rows[0];
      if (!link) return null;

      await client.query("SELECT set_config('app.centre_id', $1, true)", [link.centre_id]);

      if (link.record_type === "session") {
        const record = await client.query<SessionRecordRow>(
          "SELECT subject, topics, attendance, notes, homework, next_focus FROM app.sessions WHERE id = $1 AND review_status = 'approved'",
          [link.record_id],
        );
        const row = record.rows[0];
        if (!row) return { recordType: "session" };
        return {
          recordType: "session",
          session: {
            subject: row.subject,
            topics: row.topics ?? [],
            attendance: row.attendance,
            notes: row.notes ?? undefined,
            homework: row.homework ?? undefined,
            nextFocus: row.next_focus ?? undefined,
          },
        };
      }

      return { recordType: link.record_type };
    },
  };
}

type ResolvedRow = { centre_id: string; record_type: GuardianLinkRecordType; record_id: string };
type SessionRecordRow = { subject: string; topics: string[] | null; attendance: string; notes: string | null; homework: string | null; next_focus: string | null };
