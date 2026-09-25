SELECT 'CREATE DATABASE teacher_helper_dev'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'teacher_helper_dev')\gexec