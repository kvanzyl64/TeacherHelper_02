import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { describe, expect, it } from "vitest";
import { createPostgresBillingRepository } from "../../packages/integrations/src/admin/postgres-billing";

const databaseUrl = process.env.TEST_DATABASE_URL;
const suite = databaseUrl ? describe : describe.skip;

suite("PostgreSQL SaaS billing", () => {
  it("aggregates subscription revenue separately from family tuition payments", async () => {
    const pool = new Pool({ connectionString: databaseUrl });
    const client = await pool.connect();
    const centreId = randomUUID();
    const studentId = randomUUID();
    const invoiceId = randomUUID();
    const adminId = randomUUID();
    try {
      await client.query("BEGIN");
      await client.query("INSERT INTO app.centres (id, name, status) VALUES ($1, 'Billing Centre', 'active')", [centreId]);
      await client.query("INSERT INTO app.students (id, centre_id, first_name, last_name, status) VALUES ($1, $2, 'Synthetic', 'Learner', 'active')", [studentId, centreId]);
      await client.query("INSERT INTO app.invoices (id, centre_id, student_id, family_reference, period_start, period_end, total, due_at, status, created_by) VALUES ($1, $2, $3, 'FAMILY-ONLY', now(), now(), 99999, now(), 'issued', $3)", [invoiceId, centreId, studentId]);
      await client.query("INSERT INTO app.platform_admins (id, email, display_name, role, status) VALUES ($1, $2, 'Synthetic Billing Admin', 'platform_owner', 'active')", [adminId, `${adminId}@synthetic.invalid`]);
      await client.query("INSERT INTO app.saas_subscriptions (centre_id, plan_name, status, started_at, monthly_value) VALUES ($1, 'Growth', 'active', now(), 1200.00)", [centreId]);
      const providerEventId = randomUUID();
      await client.query("INSERT INTO app.saas_payment_events (subscription_id, centre_id, amount, status, occurred_at, follow_up_required, provider_event_id) SELECT id, $1, 1200.00, 'paid', now(), false, $2 FROM app.saas_subscriptions WHERE centre_id = $1", [centreId, providerEventId]);
      await expect(client.query("INSERT INTO app.saas_payment_events (subscription_id, centre_id, amount, status, occurred_at, provider_event_id) SELECT id, $1, 1200.00, 'paid', now(), $2 FROM app.saas_subscriptions WHERE centre_id = $1", [centreId, providerEventId])).rejects.toThrow();

      const repository = createPostgresBillingRepository(client);
      const rows = await repository.listRows({ limit: 10 });
      const summary = await repository.getSummary();
      const payment = await client.query<{ id: string }>("SELECT id FROM app.saas_payment_events WHERE centre_id = $1", [centreId]);
      await repository.updatePayment(payment.rows[0].id, { status: "overdue", followUpRequired: true }, adminId, randomUUID());
      await repository.updatePayment(payment.rows[0].id, { status: "overdue", followUpRequired: true }, adminId, randomUUID());

      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({ centreId, planName: "Growth", monthlyValue: "1200.00", currency: "ZAR", paymentStatus: "paid" });
      expect(summary).toMatchObject({ monthlyRecurringRevenue: "1200.00", failedPayments: 0, overdueCentres: 0 });
      expect((await repository.getSummary()).monthlyRecurringRevenue).toBe("1200.00");
      expect((await client.query("SELECT status, follow_up_required FROM app.saas_payment_events WHERE id = $1", [payment.rows[0].id])).rows[0]).toEqual({ status: "overdue", follow_up_required: true });
      expect((await client.query("SELECT action, outcome FROM app.platform_audit_events WHERE actor_admin_id = $1", [adminId])).rows).toEqual([{ action: "billing.payment.update", outcome: "allowed" }]);
      expect((await client.query("SELECT COUNT(*)::int AS count FROM app.invoices WHERE centre_id = $1", [centreId])).rows[0].count).toBe(1);
      await client.query("ROLLBACK");
    } finally {
      await client.query("ROLLBACK").catch(() => undefined);
      client.release();
      await pool.end();
    }
  });
});
