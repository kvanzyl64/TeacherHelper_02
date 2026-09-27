import { Pool } from "pg";

const connectionString = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("Set TEST_DATABASE_URL to teacher_helper_test");
const databaseUrl = new URL(connectionString);
const databaseName = decodeURIComponent(databaseUrl.pathname.replace(/^\//, ""));
if (!["127.0.0.1", "localhost", "::1"].includes(databaseUrl.hostname) || databaseName !== "teacher_helper_test") {
  throw new Error("Phase 3 seed is restricted to local teacher_helper_test");
}

const ids = {
  centreA: "10000000-0000-0000-0000-000000000001",
  centreB: "10000000-0000-0000-0000-000000000002",
  identityOwnerA: "10000000-0000-0000-0000-000000000011",
  identityTutorA: "10000000-0000-0000-0000-000000000012",
  identityAdminA: "10000000-0000-0000-0000-000000000013",
  identityOwnerB: "10000000-0000-0000-0000-000000000014",
  userOwnerA: "10000000-0000-0000-0000-000000000021",
  userTutorA: "10000000-0000-0000-0000-000000000022",
  userAdminA: "10000000-0000-0000-0000-000000000023",
  userOwnerB: "10000000-0000-0000-0000-000000000024",
  studentA1: "10000000-0000-0000-0000-000000000101",
  studentA2: "10000000-0000-0000-0000-000000000102",
  studentB1: "10000000-0000-0000-0000-000000000103",
  guardianA1: "10000000-0000-0000-0000-000000000201",
  guardianB1: "10000000-0000-0000-0000-000000000202",
  relationshipA1: "10000000-0000-0000-0000-000000000301",
  consentA1: "10000000-0000-0000-0000-000000000401",
  challengeA1: "10000000-0000-0000-0000-000000000501",
  assignmentA1: "10000000-0000-0000-0000-000000000601",
  sessionA1: "10000000-0000-0000-0000-000000000701",
  resourceA1: "10000000-0000-0000-0000-000000000801",
  invoiceA1: "10000000-0000-0000-0000-000000000901",
  paymentA1: "10000000-0000-0000-0000-000000001001",
  linkA1: "10000000-0000-0000-0000-000000001101",
  notificationA1: "10000000-0000-0000-0000-000000001201",
  inviteA1: "10000000-0000-0000-0000-000000001301",
  exportA1: "10000000-0000-0000-0000-000000001401",
  retentionA1: "10000000-0000-0000-0000-000000001501",
  subscriptionA: "10000000-0000-0000-0000-000000001601",
  subscriptionB: "10000000-0000-0000-0000-000000001602",
  saasPaymentA: "10000000-0000-0000-0000-000000001701",
  platformAdmin: "10000000-0000-0000-0000-000000001801",
  platformAudit: "10000000-0000-0000-0000-000000001901",
};

const centreIds = [ids.centreA, ids.centreB];
const userIds = [ids.userOwnerA, ids.userTutorA, ids.userAdminA, ids.userOwnerB];
const identityIds = [ids.identityOwnerA, ids.identityTutorA, ids.identityAdminA, ids.identityOwnerB];
const pool = new Pool({ connectionString });
const client = await pool.connect();

try {
  await client.query("BEGIN");
  await client.query("DELETE FROM app.platform_audit_events WHERE id = $1", [ids.platformAudit]);
  await client.query("DELETE FROM app.platform_admins WHERE id = $1", [ids.platformAdmin]);
  await client.query("DELETE FROM app.payments WHERE id = $1", [ids.paymentA1]);
  await client.query("DELETE FROM app.invoices WHERE id = $1", [ids.invoiceA1]);
  await client.query("DELETE FROM app.notifications WHERE id = $1", [ids.notificationA1]);
  await client.query("DELETE FROM app.access_links WHERE id = $1", [ids.linkA1]);
  await client.query("DELETE FROM app.resources WHERE id = $1", [ids.resourceA1]);
  await client.query("DELETE FROM app.sessions WHERE id = $1", [ids.sessionA1]);
  await client.query("DELETE FROM app.tutor_assignments WHERE id = $1", [ids.assignmentA1]);
  await client.query("DELETE FROM app.verification_challenges WHERE id = $1", [ids.challengeA1]);
  await client.query("DELETE FROM app.consent_records WHERE id = $1", [ids.consentA1]);
  await client.query("DELETE FROM app.guardian_students WHERE id = $1", [ids.relationshipA1]);
  await client.query("DELETE FROM app.guardians WHERE id IN ($1, $2)", [ids.guardianA1, ids.guardianB1]);
  await client.query("DELETE FROM app.students WHERE id = ANY($1::uuid[])", [[ids.studentA1, ids.studentA2, ids.studentB1]]);
  await client.query("DELETE FROM app.membership_invites WHERE id = $1", [ids.inviteA1]);
  await client.query("DELETE FROM app.export_requests WHERE id = $1", [ids.exportA1]);
  await client.query("DELETE FROM app.retention_jobs WHERE id = $1", [ids.retentionA1]);
  await client.query("DELETE FROM app.saas_payment_events WHERE id = $1", [ids.saasPaymentA]);
  await client.query("DELETE FROM app.saas_subscriptions WHERE id = ANY($1::uuid[])", [[ids.subscriptionA, ids.subscriptionB]]);
  await client.query("DELETE FROM app.audit_events WHERE centre_id = ANY($1::uuid[])", [centreIds]);
  await client.query("DELETE FROM app.centre_memberships WHERE user_id = ANY($1::uuid[])", [userIds]);
  await client.query("DELETE FROM app.users WHERE id = ANY($1::uuid[])", [userIds]);
  await client.query("DELETE FROM app.auth_identities WHERE id = ANY($1::uuid[])", [identityIds]);
  await client.query("DELETE FROM app.centres WHERE id = ANY($1::uuid[])", [centreIds]);

  await client.query("INSERT INTO app.auth_identities (id, issuer, subject) VALUES ($1, 'https://teacher-helper.test.auth0.com/', 'owner-a'), ($2, 'https://teacher-helper.test.auth0.com/', 'tutor-a'), ($3, 'https://teacher-helper.test.auth0.com/', 'admin-a'), ($4, 'https://teacher-helper.test.auth0.com/', 'owner-b')", identityIds);
  await client.query("INSERT INTO app.users (id, identity_id, email, display_name, authentication_status) VALUES ($1, $2, 'owner@brightpath.test', 'Nandi Mokoena', 'active'), ($3, $4, 'tutor@brightpath.test', 'Liam Jacobs', 'active'), ($5, $6, 'admin@brightpath.test', 'Ayesha Naidoo', 'active'), ($7, $8, 'owner@harbourview.test', 'Daniel Botha', 'active')", [ids.userOwnerA, ids.identityOwnerA, ids.userTutorA, ids.identityTutorA, ids.userAdminA, ids.identityAdminA, ids.userOwnerB, ids.identityOwnerB]);
  await client.query("INSERT INTO app.centres (id, name, status, timezone) VALUES ($1, 'BrightPath Learning Centre', 'active', 'Africa/Johannesburg'), ($2, 'Harbour View Tutors', 'trial', 'Africa/Johannesburg')", centreIds);
  await client.query("INSERT INTO app.centre_memberships (centre_id, user_id, role, status, accepted_at) VALUES ($1, $2, 'owner', 'active', now()), ($1, $3, 'tutor', 'active', now()), ($1, $4, 'admin', 'active', now()), ($5, $6, 'owner', 'active', now())", [ids.centreA, ids.userOwnerA, ids.userTutorA, ids.userAdminA, ids.centreB, ids.userOwnerB]);

  await client.query("INSERT INTO app.students (id, centre_id, reference, name, date_of_birth, enrolment_status, goals) VALUES ($1, $2, 'BP-001', 'Mia Dlamini', '2012-04-18', 'active', 'Build confidence in algebra'), ($3, $2, 'BP-002', 'Ethan Naidoo', '2010-11-03', 'paused', 'Prepare for final exams'), ($4, $5, 'HV-001', 'Zanele Maseko', '2013-08-22', 'active', 'Strengthen reading fluency')", [ids.studentA1, ids.centreA, ids.studentA2, ids.studentB1, ids.centreB]);
  await client.query("INSERT INTO app.guardians (id, centre_id, name, whatsapp_number, whatsapp_number_status, relationship_status) VALUES ($1, $2, 'Thandi Dlamini', '27821234567', 'confirmed', 'active'), ($3, $4, 'Mandla Maseko', '27827654321', 'unconfirmed', 'pending')", [ids.guardianA1, ids.centreA, ids.guardianB1, ids.centreB]);
  await client.query("INSERT INTO app.guardian_students (id, centre_id, guardian_id, student_id, relationship, status, relationship_confirmed_at, relationship_confirmed_by) VALUES ($1, $2, $3, $4, 'mother', 'active', now() - interval '4 days', $5)", [ids.relationshipA1, ids.centreA, ids.guardianA1, ids.studentA1, ids.userAdminA]);
  await client.query("INSERT INTO app.consent_records (id, centre_id, student_id, guardian_id, purpose, decision, recorded_by, expires_at) VALUES ($1, $2, $3, $4, 'session_updates', 'granted', $5, now() + interval '180 days')", [ids.consentA1, ids.centreA, ids.studentA1, ids.guardianA1, ids.userAdminA]);
  await client.query("INSERT INTO app.verification_challenges (id, centre_id, guardian_id, channel, purpose, code_digest, expires_at) VALUES ($1, $2, $3, 'whatsapp', 'guardian_number', 'synthetic-code-digest', now() + interval '10 minutes')", [ids.challengeA1, ids.centreA, ids.guardianA1]);
  await client.query("INSERT INTO app.tutor_assignments (id, centre_id, student_id, tutor_user_id, status, starts_at, assigned_by) VALUES ($1, $2, $3, $4, 'active', now() - interval '30 days', $5)", [ids.assignmentA1, ids.centreA, ids.studentA1, ids.userTutorA, ids.userAdminA]);
  await client.query("INSERT INTO app.sessions (id, centre_id, student_id, tutor_user_id, occurred_at, duration_minutes, subject, topics, attendance, notes, review_status, approved_at, approved_by) VALUES ($1, $2, $3, $4, now() - interval '2 days', 60, 'Mathematics', ARRAY['fractions', 'equations'], 'present', 'Mia explained her method clearly after guided practice.', 'approved', now() - interval '1 day', $5)", [ids.sessionA1, ids.centreA, ids.studentA1, ids.userTutorA, ids.userAdminA]);
  await client.query("INSERT INTO app.resources (id, centre_id, session_id, name, storage_reference, content_type, size_bytes, visibility, created_by) VALUES ($1, $2, $3, 'Algebra practice sheet.pdf', 'synthetic/brightpath/algebra-practice.pdf', 'application/pdf', 48231, 'guardian', $4)", [ids.resourceA1, ids.centreA, ids.sessionA1, ids.userTutorA]);
  await client.query("INSERT INTO app.invoices (id, centre_id, student_id, family_reference, period_start, period_end, line_items, subtotal, total, due_at, status, created_by, issued_at, total_paid) VALUES ($1, $2, $3, 'BP-DLAMINI-2026-09', date_trunc('month', now()), date_trunc('month', now()) + interval '1 month - 1 day', '[{\"description\":\"September tuition\",\"amount\":950}]', 950, 950, now() + interval '14 days', 'issued', $4, now(), 0)", [ids.invoiceA1, ids.centreA, ids.studentA1, ids.userAdminA]);
  await client.query("INSERT INTO app.payments (id, centre_id, invoice_id, method, amount, received_at, reference, recorded_by) VALUES ($1, $2, $3, 'eft', 950, now(), 'BP-SEP-001', $4)", [ids.paymentA1, ids.centreA, ids.invoiceA1, ids.userAdminA]);
  await client.query("UPDATE app.invoices SET status = 'paid', total_paid = 950 WHERE id = $1", [ids.invoiceA1]);
  await client.query("INSERT INTO app.access_links (id, centre_id, guardian_id, student_id, record_type, record_id, token_digest, status, expires_at) VALUES ($1, $2, $3, $4, 'session', $5, 'synthetic-access-link-digest', 'active', now() + interval '7 days')", [ids.linkA1, ids.centreA, ids.guardianA1, ids.studentA1, ids.sessionA1]);
  await client.query("INSERT INTO app.notifications (id, centre_id, guardian_id, student_id, access_link_id, kind, template_key, provider_message_id, status, attempt_count, delivered_at) VALUES ($1, $2, $3, $4, $5, 'session_update', 'session-update-v1', 'wamid.synthetic.001', 'delivered', 1, now() - interval '1 day')", [ids.notificationA1, ids.centreA, ids.guardianA1, ids.studentA1, ids.linkA1]);
  await client.query("INSERT INTO app.membership_invites (id, centre_id, email, role, status, token_digest, expires_at) VALUES ($1, $2, 'new.tutor@brightpath.test', 'tutor', 'invited', 'synthetic-invite-digest', now() + interval '72 hours')", [ids.inviteA1, ids.centreA]);
  await client.query("INSERT INTO app.export_requests (id, centre_id, requested_by, scope, status, storage_reference, expires_at) VALUES ($1, $2, $3, 'student_session', 'ready', 'synthetic/exports/brightpath-september.zip', now() + interval '3 days')", [ids.exportA1, ids.centreA, ids.userOwnerA]);
  await client.query("INSERT INTO app.retention_jobs (id, centre_id, retention_class, status, record_count) VALUES ($1, $2, 'student_session', 'scheduled', 4)", [ids.retentionA1, ids.centreA]);
  await client.query("INSERT INTO app.saas_subscriptions (id, centre_id, plan_name, status, started_at, trial_ends_at, monthly_value) VALUES ($1, $2, 'Growth', 'active', now() - interval '90 days', NULL, 1299), ($3, $4, 'Starter', 'trial', now() - interval '5 days', now() + interval '9 days', 699)", [ids.subscriptionA, ids.centreA, ids.subscriptionB, ids.centreB]);
  await client.query("INSERT INTO app.saas_payment_events (id, subscription_id, centre_id, amount, status, occurred_at, follow_up_required, provider_event_id) VALUES ($1, $2, $3, 1299, 'paid', now() - interval '3 days', false, 'synthetic-saas-payment-001')", [ids.saasPaymentA, ids.subscriptionA, ids.centreA]);
  await client.query("INSERT INTO app.audit_events (id, centre_id, actor_user_id, event_type, entity_type, entity_id, request_id, metadata) VALUES ($1, $2, $3, 'session.approved', 'session', $4, 'seed-phase3-a', '{\"source\":\"synthetic-seed\"}')", ["10000000-0000-0000-0000-000000002001", ids.centreA, ids.userAdminA, ids.sessionA1]);
  await client.query("INSERT INTO app.platform_admins (id, identity_id, email, display_name, password_hash, role, status) VALUES ($1, $2, 'owner@teacher-helper.test', 'Teacher Helper Platform Owner', NULL, 'platform_owner', 'active')", [ids.platformAdmin, ids.identityOwnerA]);
  await client.query("INSERT INTO app.platform_audit_events (id, actor_admin_id, target_centre_id, action, outcome, request_id, metadata) VALUES ($1, $2, $3, 'seed_phase3', 'allowed', 'seed-phase3-platform', '{\"synthetic\":true}')", [ids.platformAudit, ids.platformAdmin, ids.centreA]);
  await client.query("COMMIT");
  console.log(JSON.stringify({ database: databaseName, centres: centreIds, studentCount: 3, guardianCount: 2, seeded: true }, null, 2));
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}