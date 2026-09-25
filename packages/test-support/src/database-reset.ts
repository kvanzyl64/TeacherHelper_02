export const localDatabaseResetSql = `
DO $$
DECLARE table_name text;
BEGIN
  FOR table_name IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'app' AND tablename <> '_bootstrap_marker'
  LOOP
    EXECUTE format('TRUNCATE TABLE app.%I RESTART IDENTITY CASCADE', table_name);
  END LOOP;
END
$$;
`;