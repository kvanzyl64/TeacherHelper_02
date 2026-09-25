CREATE TABLE IF NOT EXISTS app.tutor_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id uuid NOT NULL REFERENCES app.centres (id),
  student_id uuid NOT NULL REFERENCES app.students (id),
  tutor_user_id uuid NOT NULL REFERENCES app.users (id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'ended')),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  assigned_by uuid NOT NULL REFERENCES app.users (id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tutor_assignments_active_idx
  ON app.tutor_assignments (centre_id, student_id, tutor_user_id)
  WHERE status IN ('pending', 'active', 'paused');

ALTER TABLE app.tutor_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY tutor_assignments_isolation ON app.tutor_assignments USING (centre_id = app.current_centre_id()) WITH CHECK (centre_id = app.current_centre_id());