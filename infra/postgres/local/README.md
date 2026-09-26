# Local PostgreSQL

Install PostgreSQL 18 or the current supported release with the official Windows installer, keep the
service bound to localhost, and ensure it is running before starting the web app:

```powershell
Get-Service postgresql-x64-18
Start-Service postgresql-x64-18
Get-Command psql
psql -h localhost -U postgres -d postgres -c "SHOW listen_addresses; SHOW password_encryption;"
```

If `psql` is not found, add `C:\Program Files\PostgreSQL\18\bin` to the user PATH, open a new
PowerShell session, and retry.

To avoid repeated password prompts, use the Windows libpq password file at
`%APPDATA%\postgresql\pgpass.conf` with `127.0.0.1:5432:*:postgres:<local-password>`. Restrict the
file ACL to the development Windows user. Do not store this file in the repository or put its
contents in migration scripts.

The expected listener is `localhost` (or `127.0.0.1`) and password encryption is `scram-sha-256`.
Do not add a public firewall rule for port 5432. The scripts in this directory are safe to rerun only
when the named database and roles do not already exist; review them before applying to an existing
installation.

The local database contains synthetic development data only. Supply a generated password through the
psql `app_password` variable and keep the resulting connection string in an ignored `.env.local` file.

Create the isolated test database and role as a local administrator. Supply the password at runtime;
do not commit it or grant the role ownership, superuser, or `BYPASSRLS` privileges:

```powershell
psql -h localhost -U postgres -d postgres -v test_password="<generated-test-password>" -f infra/postgres/local/003_test_database.sql
```

The test connection URL is `postgresql://teacher_helper_test_role:<password>@127.0.0.1:5432/teacher_helper_test`.
The URL safety guard rejects every other database for test reset operations, including
`teacher_helper_dev`, and rejects non-local, staging, and production hosts.

After the migration ledger exists, apply the runtime-role hardening as a local administrator:

```powershell
psql -h localhost -U postgres -d teacher_helper_dev -f infra/postgres/local/004_runtime_roles.sql
psql -h localhost -U postgres -d teacher_helper_test -f infra/postgres/local/004_runtime_roles.sql
```

The script asserts that `teacher_helper_app` is not a superuser, does not have `BYPASSRLS`, and
does not own protected `app` tables. The migration ledger remains writable only by
`teacher_helper_migrator`.

After T002 creates the database and role, initialize the local schema with:

```powershell
psql -h localhost -U postgres -d teacher_helper_dev -f infra/postgres/local/init.sql
```

Apply database migrations in numeric order. Platform admin accounts use their own role and session
tables, separate from centre users and memberships:

```powershell
psql -h 127.0.0.1 -U postgres -d teacher_helper_dev -v ON_ERROR_STOP=1 -f packages/database/migrations/013_platform_admin_auth.sql
```

Set `DATABASE_URL` in `apps/web/.env.local` to the `teacher_helper_app` connection before starting
the web app. Provision a platform owner from an interactive terminal; the command prompts for the
email, display name, role, and a hidden password. Re-running it for the same email updates that
account's password, role, and active status:

```powershell
pnpm --filter @teacher-helper/web run create-platform-admin
```

Keep `.env.local` out of source control and use synthetic development credentials only. Never run
the local provisioning command against staging or production.

Create or rotate the application role without storing its password in source control:

```powershell
psql -h localhost -U postgres -d teacher_helper_dev -v app_password="<local-generated-password>" -f infra/postgres/local/002_roles.sql
```
