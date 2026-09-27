BEGIN;

ALTER TABLE app.users
  ADD COLUMN password_hash text,
  ADD COLUMN last_password_change_at timestamptz,
  ADD COLUMN last_login_at timestamptz;

ALTER TABLE app.platform_admins
  ADD COLUMN last_password_change_at timestamptz;

REVOKE SELECT ON app.users FROM PUBLIC, teacher_helper_app;
REVOKE SELECT ON app.platform_admins FROM PUBLIC, teacher_helper_app;
GRANT SELECT (id, email, display_name, authentication_status, last_seen_at, created_at, identity_id, last_password_change_at, last_login_at)
  ON app.users TO teacher_helper_app;
GRANT SELECT (id, email, display_name, role, status, last_login_at, created_at, updated_at, identity_id, last_password_change_at)
  ON app.platform_admins TO teacher_helper_app;

CREATE TABLE app.application_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app.users (id) ON DELETE CASCADE,
  platform_admin_id uuid REFERENCES app.platform_admins (id) ON DELETE CASCADE,
  token_digest text NOT NULL UNIQUE CHECK (token_digest ~ '^[a-f0-9]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  last_seen_at timestamptz,
  CONSTRAINT application_sessions_one_principal CHECK ((user_id IS NULL) <> (platform_admin_id IS NULL))
);

CREATE INDEX application_sessions_user_expiry_idx
  ON app.application_sessions (user_id, expires_at)
  WHERE user_id IS NOT NULL;
CREATE INDEX application_sessions_platform_admin_expiry_idx
  ON app.application_sessions (platform_admin_id, expires_at)
  WHERE platform_admin_id IS NOT NULL;

CREATE TABLE app.password_recovery_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app.users (id) ON DELETE CASCADE,
  platform_admin_id uuid REFERENCES app.platform_admins (id) ON DELETE CASCADE,
  token_digest text NOT NULL UNIQUE CHECK (token_digest ~ '^[a-f0-9]{64}$'),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'revoked', 'expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  CONSTRAINT password_recovery_one_principal CHECK ((user_id IS NULL) <> (platform_admin_id IS NULL)),
  CONSTRAINT password_recovery_used_at_consistent CHECK ((status = 'used') = (used_at IS NOT NULL))
);

CREATE INDEX password_recovery_user_status_idx
  ON app.password_recovery_requests (user_id, status, expires_at)
  WHERE user_id IS NOT NULL;
CREATE INDEX password_recovery_platform_admin_status_idx
  ON app.password_recovery_requests (platform_admin_id, status, expires_at)
  WHERE platform_admin_id IS NOT NULL;

CREATE TABLE app.auth_security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES app.users (id) ON DELETE SET NULL,
  platform_admin_id uuid REFERENCES app.platform_admins (id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN (
    'sign_in_success', 'sign_in_failure', 'sign_out', 'password_change',
    'recovery_request', 'recovery_complete', 'session_revoked', 'account_disabled', 'rate_limited'
  )),
  outcome text NOT NULL CHECK (outcome IN ('success', 'failure', 'rate_limited')),
  email_digest text CHECK (email_digest IS NULL OR email_digest ~ '^[a-f0-9]{64}$'),
  source_digest text CHECK (source_digest IS NULL OR source_digest ~ '^[a-f0-9]{64}$'),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT auth_security_events_one_principal CHECK (user_id IS NULL OR platform_admin_id IS NULL)
);

CREATE INDEX auth_security_events_email_recent_idx
  ON app.auth_security_events (email_digest, event_type, outcome, occurred_at DESC)
  WHERE email_digest IS NOT NULL;
CREATE INDEX auth_security_events_source_recent_idx
  ON app.auth_security_events (source_digest, event_type, outcome, occurred_at DESC)
  WHERE source_digest IS NOT NULL;

REVOKE ALL ON app.application_sessions, app.password_recovery_requests, app.auth_security_events FROM PUBLIC;
REVOKE ALL ON app.application_sessions, app.password_recovery_requests FROM teacher_helper_app;
GRANT INSERT ON app.auth_security_events TO teacher_helper_app;

CREATE FUNCTION app.lookup_application_accounts_by_email(supplied_email text)
RETURNS TABLE (
  principal_type text,
  principal_id uuid,
  password_hash text,
  account_status text,
  platform_role text,
  memberships jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = app, pg_temp
AS $$
  SELECT
    'centre'::text,
    account.id,
    account.password_hash,
    account.authentication_status,
    NULL::text,
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object('centreId', membership.centre_id, 'role', membership.role)
        ORDER BY membership.accepted_at NULLS LAST, membership.centre_id
      )
      FROM app.centre_memberships AS membership
      WHERE membership.user_id = account.id AND membership.status = 'active'
    ), '[]'::jsonb)
  FROM app.users AS account
  WHERE lower(trim(account.email)) = lower(trim(supplied_email))
  UNION ALL
  SELECT
    'platform_admin'::text,
    account.id,
    account.password_hash,
    account.status,
    account.role,
    '[]'::jsonb
  FROM app.platform_admins AS account
  WHERE lower(trim(account.email)) = lower(trim(supplied_email));
$$;

CREATE FUNCTION app.create_application_session(
  supplied_user_id uuid,
  supplied_platform_admin_id uuid,
  supplied_token_digest text,
  supplied_expires_at timestamptz
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = app, pg_temp
AS $$
DECLARE created_session_id uuid;
BEGIN
  IF (supplied_user_id IS NULL) = (supplied_platform_admin_id IS NULL)
      OR supplied_token_digest IS NULL
     OR supplied_token_digest !~ '^[a-f0-9]{64}$'
     OR supplied_expires_at <= now()
     OR supplied_expires_at > now() + interval '8 hours' THEN
    RETURN NULL;
  END IF;

  IF supplied_user_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM app.users AS account
    JOIN app.centre_memberships AS membership ON membership.user_id = account.id
    WHERE account.id = supplied_user_id
      AND account.authentication_status = 'active'
      AND membership.status = 'active'
  ) THEN
    RETURN NULL;
  END IF;

  IF supplied_platform_admin_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM app.platform_admins AS account
    WHERE account.id = supplied_platform_admin_id
      AND account.status = 'active'
      AND account.role = 'platform_owner'
  ) THEN
    RETURN NULL;
  END IF;

  INSERT INTO app.application_sessions (user_id, platform_admin_id, token_digest, expires_at)
  VALUES (supplied_user_id, supplied_platform_admin_id, supplied_token_digest, supplied_expires_at)
  RETURNING id INTO created_session_id;

  IF supplied_user_id IS NOT NULL THEN
    UPDATE app.users SET last_login_at = now() WHERE id = supplied_user_id;
  ELSE
    UPDATE app.platform_admins SET last_login_at = now() WHERE id = supplied_platform_admin_id;
  END IF;

  RETURN created_session_id;
END;
$$;

CREATE FUNCTION app.resolve_application_session(supplied_token_digest text)
RETURNS TABLE (
  session_id uuid,
  user_id uuid,
  platform_admin_id uuid,
  platform_role text,
  platform_status text,
  authentication_status text,
  memberships jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = app, pg_temp
AS $$
  SELECT
    auth_session.id,
    account.id,
    NULL::uuid,
    NULL::text,
    NULL::text,
    account.authentication_status,
    COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object('centreId', membership.centre_id, 'role', membership.role)
        ORDER BY membership.accepted_at NULLS LAST, membership.centre_id
      )
      FROM app.centre_memberships AS membership
      WHERE membership.user_id = account.id AND membership.status = 'active'
    ), '[]'::jsonb)
  FROM app.application_sessions AS auth_session
  JOIN app.users AS account ON account.id = auth_session.user_id
  WHERE auth_session.token_digest = supplied_token_digest
    AND auth_session.revoked_at IS NULL
    AND auth_session.expires_at > now()
    AND account.authentication_status = 'active'
    AND EXISTS (
      SELECT 1 FROM app.centre_memberships AS membership
      WHERE membership.user_id = account.id AND membership.status = 'active'
    )
  UNION ALL
  SELECT
    auth_session.id,
    NULL::uuid,
    account.id,
    account.role,
    account.status,
    NULL::text,
    '[]'::jsonb
  FROM app.application_sessions AS auth_session
  JOIN app.platform_admins AS account ON account.id = auth_session.platform_admin_id
  WHERE auth_session.token_digest = supplied_token_digest
    AND auth_session.revoked_at IS NULL
    AND auth_session.expires_at > now()
    AND account.status = 'active'
    AND account.role = 'platform_owner';
$$;

CREATE FUNCTION app.revoke_application_session(supplied_token_digest text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = app, pg_temp
AS $$
  WITH revoked AS (
    UPDATE app.application_sessions
       SET revoked_at = now()
     WHERE token_digest = supplied_token_digest AND revoked_at IS NULL
     RETURNING id
  )
  SELECT EXISTS (SELECT 1 FROM revoked);
$$;

CREATE FUNCTION app.revoke_application_sessions(
  supplied_user_id uuid,
  supplied_platform_admin_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = app, pg_temp
AS $$
DECLARE revoked_count integer;
BEGIN
  IF (supplied_user_id IS NULL) = (supplied_platform_admin_id IS NULL) THEN
    RETURN 0;
  END IF;

  UPDATE app.application_sessions
     SET revoked_at = now()
   WHERE revoked_at IS NULL
     AND ((supplied_user_id IS NOT NULL AND user_id = supplied_user_id)
       OR (supplied_platform_admin_id IS NOT NULL AND platform_admin_id = supplied_platform_admin_id));
  GET DIAGNOSTICS revoked_count = ROW_COUNT;
  RETURN revoked_count;
END;
$$;

CREATE FUNCTION app.count_recent_auth_events(
  supplied_email_digest text,
  supplied_source_digest text,
  supplied_event_type text
)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = app, pg_temp
AS $$
  SELECT count(*)::integer
  FROM app.auth_security_events AS event
  WHERE event.occurred_at > now() - interval '15 minutes'
    AND (event.email_digest = supplied_email_digest
      OR (supplied_source_digest IS NOT NULL AND event.source_digest = supplied_source_digest))
    AND (
      (supplied_event_type = 'sign_in_failure' AND (
        event.event_type = 'sign_in_failure'
        OR (event.event_type = 'rate_limited' AND event.metadata ->> 'scope' = 'sign_in')
      ))
      OR (supplied_event_type = 'recovery_request' AND (
        event.event_type = 'recovery_request'
        OR (event.event_type = 'rate_limited' AND event.metadata ->> 'scope' = 'recovery')
      ))
    );
$$;

REVOKE ALL ON FUNCTION app.lookup_application_accounts_by_email(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.create_application_session(uuid, uuid, text, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.resolve_application_session(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.revoke_application_session(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.revoke_application_sessions(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.count_recent_auth_events(text, text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION app.lookup_application_accounts_by_email(text) TO teacher_helper_app;
GRANT EXECUTE ON FUNCTION app.create_application_session(uuid, uuid, text, timestamptz) TO teacher_helper_app;
GRANT EXECUTE ON FUNCTION app.resolve_application_session(text) TO teacher_helper_app;
GRANT EXECUTE ON FUNCTION app.revoke_application_session(text) TO teacher_helper_app;
GRANT EXECUTE ON FUNCTION app.revoke_application_sessions(uuid, uuid) TO teacher_helper_app;
GRANT EXECUTE ON FUNCTION app.count_recent_auth_events(text, text, text) TO teacher_helper_app;

COMMIT;