BEGIN;

DO $$
BEGIN
  IF current_database() = 'teacher_helper_test'
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'teacher_helper_test_role') THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION app.lookup_application_accounts_by_email(text) TO teacher_helper_test_role';
    EXECUTE 'GRANT EXECUTE ON FUNCTION app.create_application_session(uuid, uuid, text, timestamptz) TO teacher_helper_test_role';
    EXECUTE 'GRANT EXECUTE ON FUNCTION app.resolve_application_session(text) TO teacher_helper_test_role';
    EXECUTE 'GRANT EXECUTE ON FUNCTION app.revoke_application_session(text) TO teacher_helper_test_role';
    EXECUTE 'GRANT EXECUTE ON FUNCTION app.revoke_application_sessions(uuid, uuid) TO teacher_helper_test_role';
    EXECUTE 'GRANT EXECUTE ON FUNCTION app.count_recent_auth_events(text, text, text) TO teacher_helper_test_role';
  END IF;
END;
$$;

COMMIT;