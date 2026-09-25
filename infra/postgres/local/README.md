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

The expected listener is `localhost` (or `127.0.0.1`) and password encryption is `scram-sha-256`.
Do not add a public firewall rule for port 5432. The scripts in this directory are safe to rerun only
when the named database and roles do not already exist; review them before applying to an existing
installation.

The local database contains synthetic development data only. Supply a generated password through the
psql `app_password` variable and keep the resulting connection string in an ignored `.env.local` file.

After T002 creates the database and role, initialize the local schema with:

```powershell
psql -h localhost -U postgres -d teacher_helper_dev -f infra/postgres/local/init.sql
```

Create or rotate the application role without storing its password in source control:

```powershell
psql -h localhost -U postgres -d teacher_helper_dev -v app_password="<local-generated-password>" -f infra/postgres/local/002_roles.sql
```