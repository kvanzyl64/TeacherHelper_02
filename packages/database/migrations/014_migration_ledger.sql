DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'teacher_helper_migrator') THEN
    CREATE ROLE teacher_helper_migrator NOLOGIN;
  END IF;
END $$;

CREATE SCHEMA IF NOT EXISTS migration_meta;

CREATE TABLE IF NOT EXISTS migration_meta.migration_ledger (
  migration_id text PRIMARY KEY CHECK (migration_id ~ '^[0-9]{3}_[a-z0-9_]+$'),
  checksum text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now(),
  applied_by text NOT NULL DEFAULT current_user,
  baseline boolean NOT NULL DEFAULT false
);

ALTER TABLE migration_meta.migration_ledger OWNER TO teacher_helper_migrator;
REVOKE ALL ON SCHEMA migration_meta FROM PUBLIC, teacher_helper_app;
REVOKE ALL ON migration_meta.migration_ledger FROM PUBLIC, teacher_helper_app;
GRANT USAGE ON SCHEMA migration_meta TO teacher_helper_migrator;
GRANT SELECT, INSERT, UPDATE ON migration_meta.migration_ledger TO teacher_helper_migrator;