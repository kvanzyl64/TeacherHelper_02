CREATE TABLE IF NOT EXISTS app.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id uuid NOT NULL REFERENCES app.centres (id),
  reference text NOT NULL,
  name text NOT NULL,
  date_of_birth date,
  enrolment_status text NOT NULL DEFAULT 'active' CHECK (enrolment_status IN ('enquiry', 'active', 'paused', 'withdrawn', 'archived')),
  academic_info text,
  accommodations text,
  goals text,
  visibility_policy text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (centre_id, reference)
);

CREATE TABLE IF NOT EXISTS app.guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id uuid NOT NULL REFERENCES app.centres (id),
  name text NOT NULL,
  whatsapp_number text NOT NULL,
  whatsapp_number_status text NOT NULL DEFAULT 'unconfirmed' CHECK (whatsapp_number_status IN ('unconfirmed', 'code_pending', 'confirmed', 'revoked')),
  relationship_status text NOT NULL DEFAULT 'pending' CHECK (relationship_status IN ('pending', 'active', 'revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS guardians_active_number_unique
  ON app.guardians (centre_id, whatsapp_number)
  WHERE whatsapp_number_status <> 'revoked';

CREATE TABLE IF NOT EXISTS app.guardian_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id uuid NOT NULL REFERENCES app.centres (id),
  guardian_id uuid NOT NULL REFERENCES app.guardians (id),
  student_id uuid NOT NULL REFERENCES app.students (id),
  relationship text NOT NULL,
  visibility_policy text,
  relationship_confirmed_at timestamptz,
  relationship_confirmed_by uuid REFERENCES app.users (id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
  UNIQUE (centre_id, guardian_id, student_id)
);

ALTER TABLE app.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.guardian_students ENABLE ROW LEVEL SECURITY;

CREATE POLICY students_isolation ON app.students USING (centre_id = app.current_centre_id()) WITH CHECK (centre_id = app.current_centre_id());
CREATE POLICY guardians_isolation ON app.guardians USING (centre_id = app.current_centre_id()) WITH CHECK (centre_id = app.current_centre_id());
CREATE POLICY guardian_students_isolation ON app.guardian_students USING (centre_id = app.current_centre_id()) WITH CHECK (centre_id = app.current_centre_id());