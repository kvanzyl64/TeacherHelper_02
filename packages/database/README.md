# Database migrations

Migrations run in numeric order against the live local `teacher_helper_dev` database first. Each
migration is forward-only and must use expand-then-contract changes:

1. Add nullable or additive structures and deploy compatible application code.
2. Backfill and validate the new structure.
3. Enforce constraints and remove the old structure in a later migration.

Apply a migration from the repository root with an administrator or migration role:

```powershell
psql -h 127.0.0.1 -U postgres -d teacher_helper_dev -v ON_ERROR_STOP=1 -f packages/database/migrations/001_centre_access.sql
```

Before applying a migration, create a database backup. Rollback means restoring the backup or
applying a documented compensating migration; destructive down scripts are not run automatically.
Migration files are immutable after they have been applied. Seeds contain synthetic development
data only and are never run against staging or production without an explicit release step.