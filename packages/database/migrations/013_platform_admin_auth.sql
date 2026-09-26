BEGIN;

CREATE TABLE app.platform_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL CHECK (length(trim(email)) > 0),
  display_name text NOT NULL CHECK (length(trim(display_name)) > 0),
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('platform_owner', 'support_readonly')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'disabled')),
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX platform_admins_email_unique ON app.platform_admins (lower(trim(email)));

CREATE TABLE app.platform_admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES app.platform_admins (id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE CHECK (length(token_hash) = 64),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz
);

CREATE INDEX platform_admin_sessions_admin_expiry
  ON app.platform_admin_sessions (admin_id, expires_at);

REVOKE ALL ON app.platform_admins, app.platform_admin_sessions FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.platform_admins, app.platform_admin_sessions TO teacher_helper_app;

COMMIT;