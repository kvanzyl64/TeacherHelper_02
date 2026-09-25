CREATE TABLE IF NOT EXISTS app.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id uuid NOT NULL REFERENCES app.centres (id),
  actor_user_id uuid REFERENCES app.users (id),
  event_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  request_id text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  retention_class text NOT NULL DEFAULT 'audit'
    CHECK (retention_class IN ('student_session', 'billing', 'audit'))
);

CREATE INDEX IF NOT EXISTS audit_events_centre_time_idx
  ON app.audit_events (centre_id, occurred_at DESC);

ALTER TABLE app.audit_events ENABLE ROW LEVEL SECURITY;