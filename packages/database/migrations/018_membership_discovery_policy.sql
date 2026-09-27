DROP POLICY IF EXISTS memberships_isolation ON app.centre_memberships;

CREATE POLICY memberships_isolation ON app.centre_memberships
  USING (centre_id = app.current_centre_id() OR user_id = app.current_user_id())
  WITH CHECK (centre_id = app.current_centre_id());