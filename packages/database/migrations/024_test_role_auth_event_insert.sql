BEGIN;

DO $$
BEGIN
  IF current_database() = 'teacher_helper_test'
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'teacher_helper_test_role') THEN
    EXECUTE 'GRANT INSERT ON TABLE app.auth_security_events TO teacher_helper_test_role';
  END IF;
END;
$$;

COMMIT;