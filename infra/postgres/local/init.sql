CREATE SCHEMA IF NOT EXISTS app AUTHORIZATION CURRENT_USER;
REVOKE ALL ON SCHEMA app FROM PUBLIC;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA app TO teacher_helper_app;

CREATE TABLE IF NOT EXISTS app._bootstrap_marker (
  id boolean PRIMARY KEY DEFAULT true,
  synthetic_only boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bootstrap_marker_is_synthetic CHECK (synthetic_only)
);

INSERT INTO app._bootstrap_marker (id, synthetic_only)
VALUES (true, true)
ON CONFLICT (id) DO NOTHING;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app TO teacher_helper_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO teacher_helper_app;