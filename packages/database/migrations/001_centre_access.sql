CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS app.centres (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(trim(name)) > 0),
  status text NOT NULL DEFAULT 'onboarding' CHECK (status IN ('onboarding', 'trial', 'active', 'suspended', 'archived')),
  branding jsonb NOT NULL DEFAULT '{}'::jsonb,
  billing_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  notification_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  timezone text NOT NULL DEFAULT 'Africa/Johannesburg',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS centres_active_name_unique
  ON app.centres (lower(trim(name)))
  WHERE status IN ('onboarding', 'trial', 'active', 'suspended');

CREATE TABLE IF NOT EXISTS app.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL CHECK (length(trim(email)) > 0),
  display_name text NOT NULL CHECK (length(trim(display_name)) > 0),
  authentication_status text NOT NULL DEFAULT 'active'
    CHECK (authentication_status IN ('pending', 'active', 'revoked')),
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON app.users (lower(trim(email)));

CREATE TABLE IF NOT EXISTS app.centre_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id uuid NOT NULL REFERENCES app.centres (id),
  user_id uuid NOT NULL REFERENCES app.users (id),
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'tutor')),
  status text NOT NULL DEFAULT 'invited'
    CHECK (status IN ('invited', 'active', 'revoked', 'expired')),
  invited_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  revoked_at timestamptz,
  UNIQUE (centre_id, user_id)
);

ALTER TABLE app.centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.centre_memberships ENABLE ROW LEVEL SECURITY;