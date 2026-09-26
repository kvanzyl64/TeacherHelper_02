ALTER TABLE app.users ADD COLUMN IF NOT EXISTS identity_id uuid;

CREATE TABLE IF NOT EXISTS app.auth_identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issuer text NOT NULL CHECK (length(trim(issuer)) > 0),
  subject text NOT NULL CHECK (length(trim(subject)) > 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (issuer, subject)
);

ALTER TABLE app.users DROP CONSTRAINT IF EXISTS users_identity_id_fkey;
ALTER TABLE app.users ADD CONSTRAINT users_identity_id_fkey FOREIGN KEY (identity_id) REFERENCES app.auth_identities(id);
CREATE UNIQUE INDEX IF NOT EXISTS users_identity_id_unique ON app.users (identity_id) WHERE identity_id IS NOT NULL;

ALTER TABLE app.platform_admins ADD COLUMN IF NOT EXISTS identity_id uuid;
ALTER TABLE app.platform_admins DROP CONSTRAINT IF EXISTS platform_admins_identity_id_fkey;
ALTER TABLE app.platform_admins ADD CONSTRAINT platform_admins_identity_id_fkey FOREIGN KEY (identity_id) REFERENCES app.auth_identities(id);
CREATE UNIQUE INDEX IF NOT EXISTS platform_admins_identity_id_unique ON app.platform_admins (identity_id) WHERE identity_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS app.saas_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  centre_id uuid NOT NULL REFERENCES app.centres(id),
  plan_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('trial', 'active', 'past_due', 'cancelled', 'at_risk')),
  started_at timestamptz NOT NULL,
  trial_ends_at timestamptz,
  renewal_at timestamptz,
  ended_at timestamptz,
  monthly_value numeric(12,2) NOT NULL CHECK (monthly_value >= 0),
  currency text NOT NULL DEFAULT 'ZAR' CHECK (currency = 'ZAR'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS saas_subscriptions_active_centre_unique ON app.saas_subscriptions(centre_id) WHERE status <> 'cancelled';

CREATE TABLE IF NOT EXISTS app.saas_payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES app.saas_subscriptions(id),
  centre_id uuid NOT NULL REFERENCES app.centres(id),
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'ZAR' CHECK (currency = 'ZAR'),
  status text NOT NULL CHECK (status IN ('paid', 'failed', 'pending', 'overdue', 'disputed')),
  occurred_at timestamptz NOT NULL,
  follow_up_required boolean NOT NULL DEFAULT false,
  provider_event_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS saas_payment_events_centre_status_idx ON app.saas_payment_events(centre_id, status, occurred_at DESC);

CREATE TABLE IF NOT EXISTS app.platform_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_admin_id uuid NOT NULL REFERENCES app.platform_admins(id),
  target_centre_id uuid REFERENCES app.centres(id),
  action text NOT NULL,
  outcome text NOT NULL CHECK (outcome IN ('allowed', 'denied')),
  request_id text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

REVOKE UPDATE, DELETE ON app.platform_audit_events FROM teacher_helper_app;