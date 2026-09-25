CREATE TABLE IF NOT EXISTS app.membership_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id uuid NOT NULL REFERENCES app.centres (id),
  email text NOT NULL CHECK (length(trim(email)) > 0),
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'tutor')),
  status text NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'revoked', 'expired')),
  token_digest text NOT NULL,
  invited_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  revoked_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS membership_invites_token_digest_unique
  ON app.membership_invites (token_digest);

CREATE INDEX IF NOT EXISTS membership_invites_centre_email_idx
  ON app.membership_invites (centre_id, lower(trim(email)));

ALTER TABLE app.membership_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY membership_invites_isolation ON app.membership_invites
  USING (centre_id = app.current_centre_id())
  WITH CHECK (centre_id = app.current_centre_id());
