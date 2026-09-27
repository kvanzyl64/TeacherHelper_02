type QueryClient = {
  query<T extends Record<string, unknown> = Record<string, unknown>>(text: string, values?: readonly unknown[]): Promise<{ rows: T[] }>;
};

export type SessionSummary = { id: string; subject: string; occurredAt: Date; reviewStatus: string; tutorUserId: string };
export type AssignedStudentSummary = { id: string; reference: string; name: string; enrolmentStatus: string };
export type ResourceSummary = { id: string; name: string; contentType: string; visibility: string };
export type InvoiceSummary = { id: string; familyReference: string; total: string; totalPaid: string; status: string; dueAt: Date };
export type PaymentSummary = { id: string; invoiceId: string; amount: string; method: string; reference: string; receivedAt: Date };
export type ExportSummary = { id: string; scope: string; status: string; requestedAt: Date; expiresAt: Date | null };
export type OperationsSummary = { failedNotifications: number; scheduledRetentionJobs: number; recentAuditEvents: number };

export function createPostgresCentreWorkflowRepository(client: QueryClient) {
  return {
    async listSessions(input: { centreId: string; userId: string; role: "owner" | "admin" | "tutor" }): Promise<readonly SessionSummary[]> {
      const result = await client.query<SessionRow>(
        `SELECT id, subject, occurred_at, review_status, tutor_user_id
           FROM app.sessions
          WHERE centre_id = $1 AND ($3 IN ('owner', 'admin') OR tutor_user_id = $2)
          ORDER BY occurred_at DESC`,
        [input.centreId, input.userId, input.role],
      );
      return result.rows.map((row) => ({ id: row.id, subject: row.subject, occurredAt: row.occurred_at, reviewStatus: row.review_status, tutorUserId: row.tutor_user_id }));
    },

    async listAssignedStudents(input: { centreId: string; userId: string }): Promise<readonly AssignedStudentSummary[]> {
      const result = await client.query<AssignedStudentRow>(
        `SELECT DISTINCT s.id, s.reference, s.name, s.enrolment_status
           FROM app.students s
           JOIN app.tutor_assignments ta ON ta.student_id = s.id AND ta.centre_id = s.centre_id
          WHERE s.centre_id = $1 AND ta.tutor_user_id = $2 AND ta.status IN ('pending', 'active', 'paused')
          ORDER BY s.name, s.reference`,
        [input.centreId, input.userId],
      );
      return result.rows.map((row) => ({ id: row.id, reference: row.reference, name: row.name, enrolmentStatus: row.enrolment_status }));
    },

    async listSessionResources(input: { centreId: string; sessionId: string; userId: string; role: "owner" | "admin" | "tutor" }): Promise<readonly ResourceSummary[]> {
      const result = await client.query<ResourceRow>(
        `SELECT r.id, r.name, r.content_type, r.visibility
           FROM app.resources r
           JOIN app.sessions se ON se.id = r.session_id AND se.centre_id = r.centre_id
          WHERE r.centre_id = $1 AND r.session_id = $2
            AND ($4 IN ('owner', 'admin') OR se.tutor_user_id = $3)
          ORDER BY r.created_at DESC`,
        [input.centreId, input.sessionId, input.userId, input.role],
      );
      return result.rows.map((row) => ({ id: row.id, name: row.name, contentType: row.content_type, visibility: row.visibility }));
    },

    async listInvoices(centreId: string): Promise<readonly InvoiceSummary[]> {
      const result = await client.query<InvoiceRow>("SELECT id, family_reference, total::text, total_paid::text, status, due_at FROM app.invoices WHERE centre_id = $1 ORDER BY due_at DESC", [centreId]);
      return result.rows.map((row) => ({ id: row.id, familyReference: row.family_reference, total: row.total, totalPaid: row.total_paid, status: row.status, dueAt: row.due_at }));
    },

    async listPayments(centreId: string): Promise<readonly PaymentSummary[]> {
      const result = await client.query<PaymentRow>("SELECT id, invoice_id, amount::text, method, reference, received_at FROM app.payments WHERE centre_id = $1 ORDER BY received_at DESC", [centreId]);
      return result.rows.map((row) => ({ id: row.id, invoiceId: row.invoice_id, amount: row.amount, method: row.method, reference: row.reference, receivedAt: row.received_at }));
    },

    async listExports(centreId: string): Promise<readonly ExportSummary[]> {
      const result = await client.query<ExportRow>("SELECT id, scope, status, requested_at, expires_at FROM app.export_requests WHERE centre_id = $1 ORDER BY requested_at DESC", [centreId]);
      return result.rows.map((row) => ({ id: row.id, scope: row.scope, status: row.status, requestedAt: row.requested_at, expiresAt: row.expires_at }));
    },

    async getOperationsSummary(centreId: string): Promise<OperationsSummary> {
      const result = await client.query<OperationsRow>(`SELECT
        (SELECT count(*)::int FROM app.notifications WHERE centre_id = $1 AND status = 'failed') AS failed_notifications,
        (SELECT count(*)::int FROM app.retention_jobs WHERE centre_id = $1 AND status = 'scheduled') AS scheduled_retention_jobs,
        (SELECT count(*)::int FROM app.audit_events WHERE centre_id = $1 AND occurred_at >= now() - interval '30 days') AS recent_audit_events`, [centreId]);
      const row = result.rows[0];
      return { failedNotifications: row?.failed_notifications ?? 0, scheduledRetentionJobs: row?.scheduled_retention_jobs ?? 0, recentAuditEvents: row?.recent_audit_events ?? 0 };
    },
  };
}

type SessionRow = { id: string; subject: string; occurred_at: Date; review_status: string; tutor_user_id: string };
type AssignedStudentRow = { id: string; reference: string; name: string; enrolment_status: string };
type ResourceRow = { id: string; name: string; content_type: string; visibility: string };
type InvoiceRow = { id: string; family_reference: string; total: string; total_paid: string; status: string; due_at: Date };
type PaymentRow = { id: string; invoice_id: string; amount: string; method: string; reference: string; received_at: Date };
type ExportRow = { id: string; scope: string; status: string; requested_at: Date; expires_at: Date | null };
type OperationsRow = { failed_notifications: number; scheduled_retention_jobs: number; recent_audit_events: number };