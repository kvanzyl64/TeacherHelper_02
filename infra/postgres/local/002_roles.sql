SELECT format('CREATE ROLE teacher_helper_app LOGIN PASSWORD %L', :'app_password')
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'teacher_helper_app')\gexec

ALTER ROLE teacher_helper_app LOGIN PASSWORD :'app_password';

REVOKE ALL ON DATABASE teacher_helper_dev FROM PUBLIC;
GRANT CONNECT ON DATABASE teacher_helper_dev TO teacher_helper_app;