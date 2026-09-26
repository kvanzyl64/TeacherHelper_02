# Research: Database-Backed Product Readiness

## Phase 1 Provider Readiness

**Selected provider**: Auth0 OIDC, isolated behind a server-only provider adapter. Development
and test tenants are separate from production, so test identities cannot authenticate against the
production tenant. The provider is selected for standards-based OIDC discovery and authorization
code flow; no provider SDK is required in domain or repository code.

Required environment configuration names (values remain outside source control):

- `OIDC_ISSUER_URL`
- `OIDC_CLIENT_ID`
- `OIDC_CLIENT_SECRET`
- `OIDC_AUDIENCE`
- `OIDC_JWKS_URI`
- `OIDC_AUTHORIZATION_ENDPOINT`
- `OIDC_TOKEN_ENDPOINT`
- `OIDC_REDIRECT_URI`
- `OIDC_DEV_TENANT`
- `OIDC_TEST_TENANT`

The test strategy is a signed OIDC fixture or a dedicated Auth0 test tenant, selected by the test
environment. Tests must resolve issuer/subject through the application mapping and never use
production identities or credentials.

## Decision: Use managed OIDC for authentication

**Decision**: Authenticate centre staff, guardians where applicable, and the SaaS owner through a managed OpenID Connect provider. The application stores provider `issuer` and `subject` mappings and application roles; it does not store user passwords or implement a parallel credential/session system. Keep provider configuration behind an OIDC contract so deployment configuration can select the managed provider.

**Rationale**: The project constitution requires managed authentication. The current platform-admin password hash and database-session design is a custom authentication system and therefore cannot be treated as the target architecture. The Next.js authentication guide recommends using an authentication library/provider and placing authorization in a server-side data access layer close to data access.

**Alternatives considered**:

- Keep the custom password and session tables: rejected because it conflicts with the constitution's managed-authentication requirement and duplicates identity/session responsibilities.
- Couple identity directly to a database email field: rejected because email may change; use the provider's stable issuer/subject pair for identity mapping.
- Select a provider-specific SDK in domain code: rejected because the provider is deployment configuration; isolate it behind a server-side OIDC adapter.

## Decision: Centralize authorization and database reads in a server-only DAL

**Decision**: Route pages, Server Actions, and Route Handlers call a server-only data access layer. The DAL verifies the managed identity, resolves active centre memberships or platform-admin role, checks the requested permission, and returns narrow page DTOs from repository interfaces. Pages do not construct SQL or import fixture arrays.

**Rationale**: Next.js recommends data access layers for centralized session verification and authorization, and warns that layouts or Proxy checks alone do not protect nested Server Actions or data access. The existing integration/domain boundary is a suitable owner for repositories and business-safe DTOs.

**Alternatives considered**:

- Query PostgreSQL directly from each page: rejected because it duplicates authorization and creates inconsistent page-to-table mappings.
- Treat a role constant in a layout as authentication: rejected because it does not prove identity or centre membership.
- Keep fixture-backed page implementations as a fallback: rejected for runtime paths; fixtures remain test-only.

## Decision: Apply tenant context transaction-locally and enforce RLS on every tenant table

**Decision**: Every tenant query runs within a transaction that first sets `app.centre_id` and `app.user_id` using transaction-local settings, then executes authorized SQL on the checked-out pool client. The transaction commits or rolls back before the client is released. Runtime roles must not own protected tables and must not have `BYPASSRLS`. Every table containing a `centre_id`, including billing and retention/export tables, must have tested RLS policies.

**Rationale**: PostgreSQL applies policies only when RLS is enabled; table owners normally bypass policies. Transaction-local context prevents a pooled connection from carrying one tenant's context into another request. The PostgreSQL documentation requires explicit policies and notes that superusers, `BYPASSRLS` roles, and table owners bypass row security. node-postgres recommends a bounded shared pool and checked-out clients for transactions.

**Alternatives considered**:

- Session-level `SET app.centre_id` on pooled connections: rejected because context can leak across requests.
- Use the schema owner or `postgres` as the web runtime role: rejected because it defeats least privilege and RLS.
- Rely only on application `WHERE centre_id = ...` clauses: rejected because missing a clause would expose cross-tenant rows.

## Decision: Keep platform-wide reporting on a separately authorized, business-safe path

**Decision**: The initial SaaS admin is platform-owner-only, consistent with the spec's owner-first assumption. Cross-centre reads go through a separate server-only platform-admin repository using an explicitly restricted runtime capability and reviewed business-safe views/queries. It does not set a wildcard tenant context, expose child-level tables, or reuse the centre runtime role for unrestricted scans. Every platform action and denial writes a platform audit event.

**Rationale**: A centre-scoped RLS context cannot safely represent cross-tenant access. The constitution requires Super Admin access to be separately controlled and audited. The spec says read-only support may be added later; deferring that role resolves its release-scope ambiguity.

**Alternatives considered**:

- Set a centre context to an arbitrary requested tenant for platform reports: rejected because this silently turns a centre role into global access.
- Give the ordinary application role broad `SELECT` access and depend only on route guards: rejected because it enlarges the blast radius of a missing guard or injection flaw.
- Enable support users in release one: deferred until a separate explicit authorization and audit contract is approved.

## Decision: Reconcile and track migrations before applying missing schema

**Decision**: Preserve immutable migration files. Back up and inspect the existing local database, compare its catalog to migrations, record a verified baseline in a migration ledger under a protected metadata schema outside the application-data reset, then apply only missing migrations in dependency order. Add forward-only reconciliation migrations for discovered schema/RLS gaps; do not blindly replay migrations or rewrite migration 013. Add a database status command that fails on drift or missing migration state. The ledger is managed by the migration role, not the web runtime role.

**Rationale**: The live local database already contains early schema and the later platform-admin migration, but has no migration ledger and lacks tables from intermediate migrations. Migration 011 declares an `audit_events` shape with `CREATE TABLE IF NOT EXISTS`; that does not reconcile an existing table created by migration 002. A baseline and catalog check are needed before normal ordered updates.

**Alternatives considered**:

- Re-run all migration files against the current database: rejected because existing policies and other non-idempotent objects may fail, and `IF NOT EXISTS` can hide schema drift.
- Edit already-applied migrations: rejected by the repository's forward-only migration convention.
- Drop and recreate the local database without a backup/review: rejected because existing local data must not be silently destroyed.

## Decision: Use an isolated, real PostgreSQL database for integration tests

**Decision**: Run DB integration suites against a dedicated local `teacher_helper_test` database populated with synthetic fixtures by migrations and test seeds. Use a restricted test URL guard, deterministic cleanup, and per-test or per-worker isolation. Never point test reset utilities at `teacher_helper_dev`, staging, or production. Keep unit/contract tests fast and in-memory where they test pure domain behavior; DB behavior must have real PostgreSQL integration coverage.

**Rationale**: The current integration setup only validates the URL text; its tests use in-memory domain services. A dedicated test database makes migrations, RLS, identity mapping, repository queries, and transactions testable without risking developer data.

**Alternatives considered**:

- Run DB tests only with mocks: rejected for migration, RLS, identity, and persistence behavior.
- Truncate the shared development database in parallel tests: rejected because it is destructive and unsafe under concurrency.
- Use production-like records in local tests: rejected; only synthetic data is permitted.

## Primary Sources

- [Next.js authentication and authorization guide](https://nextjs.org/docs/app/guides/authentication): recommends an auth library/provider, a centralized server-side DAL, and authorization checks close to data access; Server Actions and Route Handlers must authorize independently.
- [PostgreSQL row security policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html): policies apply only when RLS is enabled; table owners, superusers, and `BYPASSRLS` roles bypass normal RLS enforcement.
- [node-postgres connection pooling](https://node-postgres.com/features/pooling): use a bounded shared pool; always release checked-out clients; transactions require a single checked-out client.
