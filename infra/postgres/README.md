# PostgreSQL infrastructure

Teacher Helper development uses PostgreSQL, never SQLite. Local setup creates the synthetic-data
`teacher_helper_dev` database and a least-privilege application role. Staging and production are
separate databases and credentials created only on the deployment server.

On Windows, install PostgreSQL 18 with the official package:

```powershell
winget install --id PostgreSQL.PostgreSQL.18 --exact --accept-source-agreements --accept-package-agreements
Get-Service postgresql-x64-18
Start-Service postgresql-x64-18
```

The installer must use a strong local administrator password. Keep the PostgreSQL service on its
default localhost-only listener and use SCRAM authentication; do not expose port 5432 through the
Windows firewall. Verify the client connection before running the project scripts:

```powershell
Get-Command psql
psql --version
psql -h localhost -U postgres -d postgres -c "SHOW listen_addresses; SHOW password_encryption;"
```

The PostgreSQL installer normally adds `C:\Program Files\PostgreSQL\18\bin` to PATH. If a new
PowerShell session cannot resolve `psql`, add that directory to the user PATH and open a new
terminal.

For non-interactive local development commands, configure the Windows libpq password file once at
`%APPDATA%\postgresql\pgpass.conf` with this shape:

```text
127.0.0.1:5432:*:postgres:<local-password>
```

Keep the file readable only by the Windows user that runs development commands. It is outside the
repository and must never be committed. PostgreSQL tools automatically use this file, so migrations
can run without placing a password in scripts or command history.

Run the local bootstrap from an administrator psql session after PostgreSQL is running:

```text
psql -f infra/postgres/local/001_databases.sql postgres
psql -f infra/postgres/local/002_roles.sql teacher_helper_dev
psql -f infra/postgres/local/init.sql teacher_helper_dev
```

Set `DATABASE_URL` from `.env.development.example` only after the role password has been changed.
Do not commit passwords, deployment credentials, or production data.