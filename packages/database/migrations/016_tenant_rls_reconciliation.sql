DO $$
DECLARE table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'audit_events', 'membership_invites', 'students', 'guardians', 'guardian_students',
    'consent_records', 'verification_challenges', 'tutor_assignments', 'sessions',
    'resources', 'access_links', 'notifications', 'invoices', 'payments',
    'export_requests', 'retention_jobs', 'saas_subscriptions', 'saas_payment_events'
  ] LOOP
    IF to_regclass('app.' || table_name) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE app.%I ENABLE ROW LEVEL SECURITY', table_name);
      EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON app.%I (centre_id)', table_name || '_centre_id_idx', table_name);
      EXECUTE format('DROP POLICY IF EXISTS %I ON app.%I', table_name || '_tenant_isolation', table_name);
      EXECUTE format('CREATE POLICY %I ON app.%I USING (centre_id = app.current_centre_id()) WITH CHECK (centre_id = app.current_centre_id())', table_name || '_tenant_isolation', table_name);
    END IF;
  END LOOP;
END $$;

ALTER TABLE app.saas_subscriptions FORCE ROW LEVEL SECURITY;
ALTER TABLE app.saas_payment_events FORCE ROW LEVEL SECURITY;