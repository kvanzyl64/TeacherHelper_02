BEGIN;

CREATE OR REPLACE FUNCTION app.create_application_session(
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
DECLARE
  created_session_id uuid;
  observed_at timestamptz := clock_timestamp();
BEGIN
  IF (supplied_user_id IS NULL) = (supplied_platform_admin_id IS NULL)
     OR supplied_token_digest IS NULL
     OR supplied_token_digest !~ '^[a-f0-9]{64}$'
     OR supplied_expires_at IS NULL
     OR supplied_expires_at <= observed_at
     OR supplied_expires_at > observed_at + interval '8 hours' THEN
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
    UPDATE app.users SET last_login_at = observed_at WHERE id = supplied_user_id;
  ELSE
    UPDATE app.platform_admins SET last_login_at = observed_at WHERE id = supplied_platform_admin_id;
  END IF;

  RETURN created_session_id;
END;
$$;

COMMIT;