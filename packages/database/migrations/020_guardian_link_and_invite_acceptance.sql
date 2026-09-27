-- Forward-only functions for unauthenticated token flows.
-- These run SECURITY DEFINER so a visitor without centre context can be validated
-- server-side, mirroring app.verify_guardian_challenge. They never trust caller-supplied
-- identity or centre IDs; every decision is derived from the stored token digest.

-- Correct the earlier definer function's owner: teacher_helper_migrator is an access-less
-- NOLOGIN marker role, so a definer body owned by it cannot reach schema app. The schema
-- owner is the correct definer for these controlled, parameterized cross-context lookups.
ALTER FUNCTION app.verify_guardian_challenge(uuid, text) OWNER TO CURRENT_USER;

-- Resolve an opaque guardian access-link token to exactly one authorized record.
-- Validates link status/expiry, an active guardian relationship, and granted consent
-- before marking the link opened and returning business-safe routing metadata.
CREATE OR REPLACE FUNCTION app.resolve_guardian_link(supplied_digest text)
RETURNS TABLE (centre_id uuid, record_type text, record_id uuid, guardian_id uuid, student_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = app, public
AS $$
DECLARE link app.access_links%ROWTYPE;
BEGIN
  SELECT * INTO link FROM app.access_links WHERE token_digest = supplied_digest FOR UPDATE;
  IF NOT FOUND OR link.status <> 'active' OR link.expires_at <= now() THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM app.guardian_students gs
     WHERE gs.centre_id = link.centre_id
       AND gs.guardian_id = link.guardian_id
       AND gs.student_id = link.student_id
       AND gs.status = 'active'
  ) THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM app.consent_records cr
     WHERE cr.centre_id = link.centre_id
       AND cr.guardian_id = link.guardian_id
       AND cr.student_id = link.student_id
       AND cr.decision = 'granted'
       AND cr.withdrawn_at IS NULL
       AND (cr.expires_at IS NULL OR cr.expires_at > now())
  ) THEN
    RETURN;
  END IF;

  UPDATE app.access_links SET opened_at = now() WHERE id = link.id;

  centre_id := link.centre_id;
  record_type := link.record_type;
  record_id := link.record_id;
  guardian_id := link.guardian_id;
  student_id := link.student_id;
  RETURN NEXT;
END;
$$;

-- Owned by the schema owner (the migration superuser) so the definer body can bypass
-- tenant RLS for these validated, parameterized token lookups. The runtime app role only
-- receives EXECUTE; it never gains direct table access or an RLS bypass of its own.
GRANT EXECUTE ON FUNCTION app.resolve_guardian_link(text) TO teacher_helper_app;

-- Accept a centre membership invite for a managed OIDC identity.
-- Self-provisions the identity mapping and user profile the first time an invited
-- person signs in, creates the membership only in the invite's centre, and records
-- an audit event. Returns the centre and granted role, or nothing for an invalid,
-- expired, or already-consumed invite.
CREATE OR REPLACE FUNCTION app.accept_membership_invite(
  supplied_digest text,
  actor_issuer text,
  actor_subject text,
  actor_email text,
  actor_display_name text
)
RETURNS TABLE (accepted_centre_id uuid, accepted_role text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = app, public
AS $$
DECLARE
  invite app.membership_invites%ROWTYPE;
  resolved_identity_id uuid;
  resolved_user_id uuid;
BEGIN
  SELECT * INTO invite FROM app.membership_invites WHERE token_digest = supplied_digest FOR UPDATE;
  IF NOT FOUND OR invite.status <> 'invited' THEN
    RETURN;
  END IF;
  IF invite.expires_at <= now() THEN
    UPDATE app.membership_invites SET status = 'expired' WHERE id = invite.id;
    RETURN;
  END IF;

  INSERT INTO app.auth_identities (issuer, subject, status)
  VALUES (actor_issuer, actor_subject, 'active')
  ON CONFLICT (issuer, subject) DO UPDATE SET status = 'active'
  RETURNING id INTO resolved_identity_id;

  SELECT id INTO resolved_user_id FROM app.users WHERE identity_id = resolved_identity_id;
  IF resolved_user_id IS NULL THEN
    INSERT INTO app.users (email, display_name, authentication_status, identity_id)
    VALUES (actor_email, actor_display_name, 'active', resolved_identity_id)
    RETURNING id INTO resolved_user_id;
  END IF;

  INSERT INTO app.centre_memberships (centre_id, user_id, role, status, accepted_at)
  VALUES (invite.centre_id, resolved_user_id, invite.role, 'active', now())
  ON CONFLICT (centre_id, user_id) DO UPDATE SET role = EXCLUDED.role, status = 'active', accepted_at = now();

  UPDATE app.membership_invites SET status = 'active', accepted_at = now() WHERE id = invite.id;

  INSERT INTO app.audit_events (centre_id, actor_user_id, event_type, entity_type, entity_id, request_id, metadata)
  VALUES (invite.centre_id, resolved_user_id, 'membership.invite.accepted', 'centre_membership', invite.id, 'invite-accept-' || invite.id::text, jsonb_build_object('role', invite.role));

  accepted_centre_id := invite.centre_id;
  accepted_role := invite.role;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION app.accept_membership_invite(text, text, text, text, text) TO teacher_helper_app;
