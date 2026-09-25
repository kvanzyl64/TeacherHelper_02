CREATE TABLE IF NOT EXISTS app.access_links (
  id uuid PRIMARY KEY,
  centre_id uuid NOT NULL,
  guardian_id uuid NOT NULL,
  student_id uuid NOT NULL,
  record_type text NOT NULL CHECK (record_type IN ('session', 'resource', 'invoice', 'receipt')),
  record_id uuid NOT NULL,
  token_digest text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'active', 'expired', 'revoked', 'consumed')),
  sent_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  opened_at timestamptz,
  revoked_at timestamptz,
  last_failure_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app.notifications (
  id uuid PRIMARY KEY,
  centre_id uuid NOT NULL,
  guardian_id uuid NOT NULL,
  student_id uuid NOT NULL,
  access_link_id uuid REFERENCES app.access_links(id),
  kind text NOT NULL CHECK (kind IN ('session_update', 'invoice', 'verification', 'delivery_failure')),
  template_key text NOT NULL,
  provider_message_id text,
  status text NOT NULL CHECK (status IN ('queued', 'sending', 'delivered', 'failed', 'retrying', 'cancelled')),
  attempt_count integer NOT NULL DEFAULT 0,
  last_attempt_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
