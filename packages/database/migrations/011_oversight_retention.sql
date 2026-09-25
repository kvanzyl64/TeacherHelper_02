BEGIN;

CREATE TABLE IF NOT EXISTS app.audit_events (
  id uuid PRIMARY KEY,
  centre_id uuid NOT NULL,
  actor_user_id uuid,
  event_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  request_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  retention_class text NOT NULL DEFAULT 'audit' CHECK (retention_class IN ('student_session', 'billing', 'audit'))
);

CREATE TABLE IF NOT EXISTS app.export_requests (
  id uuid PRIMARY KEY,
  centre_id uuid NOT NULL,
  requested_by uuid NOT NULL,
  scope text NOT NULL CHECK (scope IN ('student_session', 'billing', 'audit', 'centre')),
  status text NOT NULL CHECK (status IN ('requested', 'processing', 'ready', 'failed', 'expired', 'deleted')),
  storage_reference text NOT NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz,
  failure_reason text
);

CREATE TABLE IF NOT EXISTS app.retention_policies (
  id uuid PRIMARY KEY,
  retention_class text NOT NULL UNIQUE CHECK (retention_class IN ('student_session', 'billing', 'audit')),
  retention_period_days integer NOT NULL,
  legal_hold boolean NOT NULL DEFAULT false,
  effective_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_events_centre
  ON app.audit_events (centre_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_export_requests_centre_status
  ON app.export_requests (centre_id, status);

COMMIT;
