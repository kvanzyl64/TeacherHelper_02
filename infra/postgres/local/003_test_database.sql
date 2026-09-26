-- Run as a local administrator. Supply a generated value with -v test_password="...".
SELECT format('CREATE DATABASE teacher_helper_test')
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'teacher_helper_test')\gexec

SELECT format('CREATE ROLE teacher_helper_test_role LOGIN PASSWORD %L', :'test_password')
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'teacher_helper_test_role')\gexec

ALTER ROLE teacher_helper_test_role LOGIN PASSWORD :'test_password' NOSUPERUSER NOBYPASSRLS;
REVOKE ALL ON DATABASE teacher_helper_test FROM PUBLIC;
GRANT CONNECT ON DATABASE teacher_helper_test TO teacher_helper_test_role;