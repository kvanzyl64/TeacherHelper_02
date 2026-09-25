CREATE TABLE IF NOT EXISTS app.sessions (
  id uuid PRIMARY KEY,
  centre_id uuid NOT NULL,
  student_id uuid NOT NULL,
  tutor_user_id uuid NOT NULL,
  occurred_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  subject text NOT NULL,
  topics text[] NOT NULL DEFAULT '{}',
  attendance text NOT NULL CHECK (attendance IN ('present', 'absent', 'late', 'excused')),
  notes text,
  homework text,
  next_focus text,
  review_status text NOT NULL CHECK (review_status IN ('draft', 'submitted', 'approved', 'rejected', 'superseded')),
  approved_at timestamptz,
  approved_by uuid,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.resources (
  id uuid PRIMARY KEY,
  centre_id uuid NOT NULL,
  session_id uuid NOT NULL REFERENCES app.sessions(id),
  name text NOT NULL,
  storage_reference text NOT NULL,
  content_type text NOT NULL,
  size_bytes bigint NOT NULL CHECK (size_bytes >= 0),
  visibility text NOT NULL CHECK (visibility IN ('guardian', 'restricted', 'internal')),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
