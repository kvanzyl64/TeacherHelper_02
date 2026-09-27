CREATE OR REPLACE FUNCTION app.verify_guardian_challenge(challenge_id uuid, supplied_digest text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = app, public
AS $$
DECLARE challenge app.verification_challenges%ROWTYPE;
BEGIN
  SELECT * INTO challenge FROM app.verification_challenges WHERE id = challenge_id FOR UPDATE;
  IF NOT FOUND OR challenge.status <> 'pending' OR challenge.expires_at <= now() OR challenge.attempt_count >= 5 THEN
    RETURN false;
  END IF;

  IF challenge.code_digest = supplied_digest THEN
    UPDATE app.verification_challenges SET status = 'confirmed', confirmed_at = now() WHERE id = challenge_id;
    UPDATE app.guardians SET whatsapp_number_status = 'confirmed', relationship_status = 'active', updated_at = now() WHERE id = challenge.guardian_id;
    RETURN true;
  END IF;

  UPDATE app.verification_challenges SET attempt_count = attempt_count + 1, status = CASE WHEN attempt_count + 1 >= 5 THEN 'exhausted' ELSE status END WHERE id = challenge_id;
  RETURN false;
END;
$$;

ALTER FUNCTION app.verify_guardian_challenge(uuid, text) OWNER TO teacher_helper_migrator;
GRANT EXECUTE ON FUNCTION app.verify_guardian_challenge(uuid, text) TO teacher_helper_app;