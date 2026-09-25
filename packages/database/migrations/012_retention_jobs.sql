BEGIN;

CREATE TABLE IF NOT EXISTS app.retention_jobs (
  id uuid PRIMARY KEY,
  centre_id uuid NOT NULL,
  retention_class text NOT NULL CHECK (retention_class IN ('student_session', 'billing', 'audit')),
  status text NOT NULL CHECK (status IN ('scheduled', 'processing', 'deleted', 'failed')),
  record_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_retention_jobs_centre_class
  ON app.retention_jobs (centre_id, retention_class, created_at DESC);

COMMIT;
