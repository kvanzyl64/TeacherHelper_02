CREATE OR REPLACE FUNCTION app.current_centre_id() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('app.centre_id', true), '')::uuid
$$;

CREATE OR REPLACE FUNCTION app.current_user_id() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('app.user_id', true), '')::uuid
$$;

CREATE POLICY centres_isolation ON app.centres
  USING (id = app.current_centre_id())
  WITH CHECK (id = app.current_centre_id());

CREATE POLICY users_isolation ON app.users
  USING (EXISTS (
    SELECT 1 FROM app.centre_memberships membership
    WHERE membership.user_id = users.id
      AND membership.centre_id = app.current_centre_id()
      AND membership.status = 'active'
  ))
  WITH CHECK (true);

CREATE POLICY memberships_isolation ON app.centre_memberships
  USING (centre_id = app.current_centre_id())
  WITH CHECK (centre_id = app.current_centre_id());

CREATE POLICY audit_events_isolation ON app.audit_events
  USING (centre_id = app.current_centre_id())
  WITH CHECK (centre_id = app.current_centre_id());