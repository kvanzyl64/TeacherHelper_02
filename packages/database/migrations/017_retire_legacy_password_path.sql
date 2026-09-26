ALTER TABLE app.platform_admins ALTER COLUMN password_hash DROP NOT NULL;

REVOKE SELECT (password_hash) ON app.platform_admins FROM teacher_helper_app;