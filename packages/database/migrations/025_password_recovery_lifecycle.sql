BEGIN;

CREATE FUNCTION app.create_password_recovery_request(
  supplied_user_id uuid,
  supplied_platform_admin_id uuid,
  supplied_token_digest text,
  supplied_expires_at timestamptz
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = app, pg_temp
AS $$
DECLARE
  observed_at timestamptz := clock_timestamp();
BEGIN
  IF (supplied_user_id IS NULL) = (supplied_platform_admin_id IS NULL)
     OR supplied_token_digest IS NULL
     OR supplied_token_digest !~ '^[a-f0-9]{64}$'
     OR supplied_expires_at IS NULL
     OR supplied_expires_at <= observed_at
     OR supplied_expires_at > observed_at + interval '30 minutes' THEN
    RETURN false;
  END IF;

  IF supplied_user_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM app.users AS account
    WHERE account.id = supplied_user_id
      AND account.authentication_status = 'active'
      AND EXISTS (
        SELECT 1 FROM app.centre_memberships AS membership
        WHERE membership.user_id = account.id AND membership.status = 'active'
      )
  ) THEN
    RETURN false;
  END IF;

  IF supplied_platform_admin_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM app.platform_admins AS account
    WHERE account.id = supplied_platform_admin_id
      AND account.status = 'active'
      AND account.role = 'platform_owner'
  ) THEN
    RETURN false;
  END IF;

  UPDATE app.password_recovery_requests AS request
  SET status = CASE WHEN request.expires_at <= observed_at THEN 'expired' ELSE 'revoked' END
  WHERE request.user_id IS NOT DISTINCT FROM supplied_user_id
    AND request.platform_admin_id IS NOT DISTINCT FROM supplied_platform_admin_id
    AND request.status = 'pending';

  INSERT INTO app.password_recovery_requests
    (user_id, platform_admin_id, token_digest, status, expires_at)
  VALUES
    (supplied_user_id, supplied_platform_admin_id, supplied_token_digest, 'pending', supplied_expires_at);

  RETURN true;
END;
$$;

CREATE FUNCTION app.is_password_recovery_token_valid(supplied_token_digest text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = app, pg_temp
AS $$
BEGIN
  UPDATE app.password_recovery_requests AS request
  SET status = 'expired'
  WHERE request.token_digest = supplied_token_digest
    AND request.status = 'pending'
    AND request.expires_at <= clock_timestamp();

  RETURN EXISTS (
    SELECT 1
    FROM app.password_recovery_requests AS request
    WHERE request.token_digest = supplied_token_digest
      AND request.status = 'pending'
      AND request.expires_at > clock_timestamp()
      AND (
        (request.user_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM app.users AS account
          WHERE account.id = request.user_id
            AND account.authentication_status = 'active'
            AND EXISTS (
              SELECT 1 FROM app.centre_memberships AS membership
              WHERE membership.user_id = account.id AND membership.status = 'active'
            )
        ))
        OR (request.platform_admin_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM app.platform_admins AS account
          WHERE account.id = request.platform_admin_id
            AND account.status = 'active'
            AND account.role = 'platform_owner'
        ))
      )
  );
END;
$$;

CREATE FUNCTION app.complete_password_recovery(
  supplied_token_digest text,
  supplied_password_hash text
)
RETURNS TABLE (user_id uuid, platform_admin_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = app, pg_temp
AS $$
DECLARE
  recovery_request app.password_recovery_requests%ROWTYPE;
  updated_user_id uuid;
  updated_platform_admin_id uuid;
  observed_at timestamptz := clock_timestamp();
BEGIN
  IF supplied_token_digest IS NULL
     OR supplied_token_digest !~ '^[a-f0-9]{64}$'
     OR supplied_password_hash IS NULL
     OR supplied_password_hash !~ '^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$' THEN
    RETURN;
  END IF;

  UPDATE app.password_recovery_requests AS request
  SET status = 'expired'
  WHERE request.token_digest = supplied_token_digest
    AND request.status = 'pending'
    AND request.expires_at <= observed_at;

  SELECT request.* INTO recovery_request
  FROM app.password_recovery_requests AS request
  WHERE request.token_digest = supplied_token_digest
    AND request.status = 'pending'
    AND request.expires_at > observed_at
  FOR UPDATE;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF recovery_request.user_id IS NOT NULL THEN
    UPDATE app.users AS account
    SET password_hash = supplied_password_hash,
        last_password_change_at = observed_at
    WHERE account.id = recovery_request.user_id
      AND account.authentication_status = 'active'
      AND EXISTS (
        SELECT 1 FROM app.centre_memberships AS membership
        WHERE membership.user_id = account.id AND membership.status = 'active'
      )
    RETURNING account.id INTO updated_user_id;
  ELSE
    UPDATE app.platform_admins AS account
    SET password_hash = supplied_password_hash,
        last_password_change_at = observed_at
    WHERE account.id = recovery_request.platform_admin_id
      AND account.status = 'active'
      AND account.role = 'platform_owner'
    RETURNING account.id INTO updated_platform_admin_id;
  END IF;

  IF updated_user_id IS NULL AND updated_platform_admin_id IS NULL THEN
    UPDATE app.password_recovery_requests AS request
    SET status = 'revoked'
    WHERE request.id = recovery_request.id;
    RETURN;
  END IF;

  UPDATE app.password_recovery_requests AS request
  SET status = 'used', used_at = observed_at
  WHERE request.id = recovery_request.id;

  UPDATE app.password_recovery_requests AS request
  SET status = CASE WHEN request.expires_at <= observed_at THEN 'expired' ELSE 'revoked' END
  WHERE request.id <> recovery_request.id
    AND request.status = 'pending'
    AND request.user_id IS NOT DISTINCT FROM recovery_request.user_id
    AND request.platform_admin_id IS NOT DISTINCT FROM recovery_request.platform_admin_id;

  UPDATE app.application_sessions AS session
  SET revoked_at = observed_at
  WHERE session.revoked_at IS NULL
    AND ((updated_user_id IS NOT NULL AND session.user_id = updated_user_id)
      OR (updated_platform_admin_id IS NOT NULL AND session.platform_admin_id = updated_platform_admin_id));

  RETURN QUERY SELECT updated_user_id, updated_platform_admin_id;
END;
$$;

REVOKE ALL ON FUNCTION app.create_password_recovery_request(uuid, uuid, text, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.is_password_recovery_token_valid(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app.complete_password_recovery(text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION app.create_password_recovery_request(uuid, uuid, text, timestamptz) TO teacher_helper_app;
GRANT EXECUTE ON FUNCTION app.is_password_recovery_token_valid(text) TO teacher_helper_app;
GRANT EXECUTE ON FUNCTION app.complete_password_recovery(text, text) TO teacher_helper_app;

DO $$
BEGIN
  IF current_database() = 'teacher_helper_test'
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'teacher_helper_test_role') THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION app.create_password_recovery_request(uuid, uuid, text, timestamptz) TO teacher_helper_test_role';
    EXECUTE 'GRANT EXECUTE ON FUNCTION app.is_password_recovery_token_valid(text) TO teacher_helper_test_role';
    EXECUTE 'GRANT EXECUTE ON FUNCTION app.complete_password_recovery(text, text) TO teacher_helper_test_role';
  END IF;
END;
$$;

COMMIT;