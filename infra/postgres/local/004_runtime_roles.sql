DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'teacher_helper_migrator') THEN
    CREATE ROLE teacher_helper_migrator NOLOGIN;
  END IF;
END $$;

ALTER ROLE teacher_helper_app NOSUPERUSER NOBYPASSRLS;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA migration_meta FROM teacher_helper_app;
REVOKE ALL ON migration_meta.migration_ledger FROM teacher_helper_app;
GRANT USAGE ON SCHEMA app TO teacher_helper_test_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app TO teacher_helper_test_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app TO teacher_helper_test_role;

DO $$
DECLARE owner_name text;
BEGIN
  SELECT tableowner INTO owner_name
  FROM pg_tables
  WHERE schemaname = 'app' AND tableowner = 'teacher_helper_app'
  LIMIT 1;
  IF owner_name IS NOT NULL THEN
    RAISE EXCEPTION 'teacher_helper_app owns a protected app table';
  END IF;
END $$;