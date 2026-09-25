CREATE TABLE IF NOT EXISTS app.consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id uuid NOT NULL REFERENCES app.centres (id),
  student_id uuid NOT NULL REFERENCES app.students (id),
  guardian_id uuid NOT NULL REFERENCES app.guardians (id),
  purpose text NOT NULL,
  decision text NOT NULL CHECK (decision IN ('granted', 'restricted', 'withdrawn')),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  withdrawn_at timestamptz,
  recorded_by uuid REFERENCES app.users (id)
);

CREATE TABLE IF NOT EXISTS app.verification_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id uuid NOT NULL REFERENCES app.centres (id),
  guardian_id uuid NOT NULL REFERENCES app.guardians (id),
  channel text NOT NULL CHECK (channel = 'whatsapp'),
  purpose text NOT NULL CHECK (purpose = 'guardian_number'),
  code_digest text NOT NULL,
  expires_at timestamptz NOT NULL,
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0 AND attempt_count <= 5),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'expired', 'exhausted', 'revoked')),
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE app.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.verification_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY consent_records_isolation ON app.consent_records USING (centre_id = app.current_centre_id()) WITH CHECK (centre_id = app.current_centre_id());
CREATE POLICY verification_challenges_isolation ON app.verification_challenges USING (centre_id = app.current_centre_id()) WITH CHECK (centre_id = app.current_centre_id());