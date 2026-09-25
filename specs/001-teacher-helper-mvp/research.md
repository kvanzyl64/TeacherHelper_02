# Teacher Helper MVP Research

## Decision: Use TypeScript and a single Next.js web application

**Rationale**: The feature is a responsive browser product with several role-based portals and
phone-first guardian pages. A single web application keeps MVP deployment and shared validation
simple while allowing domain and integration packages to remain independently testable. TypeScript
provides one language across browser, server, contracts, and test fixtures.

**Alternatives considered**:

- A separate frontend and backend would add deployment and contract overhead before the first pilot.
- A native mobile application is explicitly out of MVP scope.
- A server-only application would make the phone-first interactive workflows and browser testing
  less direct.

## Decision: Use self-hosted PostgreSQL locally, then on the Oracle Cloud compute server

**Rationale**: Tenant isolation is a constitutional gate, not only an application convention.
PostgreSQL row-level policies can enforce centre scope close to the data, while application services
still enforce role and workflow permissions. PostgreSQL is the lightest practical SQL choice for this
project because it supports row-level security, concurrent web workloads, transactional billing,
background jobs, and mature backup/restore tooling. PostgreSQL is installed locally before application
development and remains the live development database until deployment. At deployment it is installed
and operated on the Oracle Cloud compute server; no Oracle Cloud managed SQL instance is used.

**Alternatives considered**:

- Application-only tenant filtering is rejected because a missed query could expose another centre.
- SQLite is rejected for the shared live environment because it has no native row-level security,
  weaker concurrent write behavior for a multi-user SaaS workload, and would make the constitution's
  database-enforced tenant boundary an application-only responsibility. SQLite may be used for
  isolated unit tests only if it does not replace PostgreSQL policy tests.
- Separate databases per centre are deferred because they increase operational cost and complicate
  the small-centre MVP.
- A document database is rejected because sessions, guardians, invoices, payments, consent, and
  audit relationships require transactional relational rules.

## Decision: Provision the local development database before application development

**Rationale**: PostgreSQL MUST be installed, secured, and initialized locally before application
setup. Create a local `teacher_helper_dev` database and least-privilege roles, then develop against
that live local database. At deployment, install PostgreSQL on the Oracle Cloud server, create the
server-side staging and production databases and roles, apply migrations, deploy the app, and begin
smoke/integration testing from the server. Seed data is synthetic and production credentials/data are
never used in development.

**Alternatives considered**:

- Developing directly against the remote server database is rejected because it slows local work,
  couples development to deployment availability, and increases the risk of accidental server data
  mutation.
- One shared database for development and production is rejected because it risks child-data exposure,
  unsafe migrations, and accidental production mutation.
- An Oracle Cloud managed SQL service is rejected because the deployment uses only the compute server.

## Decision: Keep application services separate from PostgreSQL administration

**Rationale**: The application uses a least-privilege application role against the local development
database and the deployed server database, while migration, backup, and restore roles are separate
and unavailable to normal application requests. PostgreSQL listens locally during development and
only on the private server interface or protected network path after deployment. This preserves a
lightweight deployment without making the web process a database administrator.

**Alternatives considered**:

- Giving the web application a superuser role is rejected because a web compromise would become a
  database and tenant-isolation compromise.
- Exposing PostgreSQL directly to the public internet is rejected because all database access must
  pass through controlled application, administration, or private development paths.

## Decision: Use private S3-compatible object storage on the Oracle server

**Rationale**: Student resources, invoice documents, and exports require protected object storage,
not public filesystem paths or database blobs. The deployment will host a lightweight S3-compatible
object-storage service on the Oracle server, using private buckets, server-side encryption, signed
temporary access, least-privilege service credentials, and backup coverage. The application accesses
storage through the existing adapter boundary, so the service can be replaced later without changing
domain workflows.

**Alternatives considered**:

- Public filesystem paths are rejected because URLs could expose child records and documents.
- Database blobs are rejected because they increase database size and complicate backup and download
  performance.
- A third-party object-storage service is deferred because the initial deployment is intentionally
  limited to the Oracle compute server.

## Decision: Use a provider adapter for WhatsApp Business messaging

**Rationale**: The MVP requires approved templates, verified guardian numbers, delivery status,
retry handling, and inbound delivery events. A `MessageProvider` boundary keeps the domain behavior
stable while provider credentials, message-template identifiers, rate limits, and regional
availability are confirmed during implementation. The initial reference integration targets the
WhatsApp Business Cloud API or an approved business solution provider.

**Alternatives considered**:

- SMS or email fallback is rejected for MVP because the clarification decision requires WhatsApp-only
  delivery and another channel may not have the same consent or verification state.
- Sending messages directly from request handlers is rejected; delivery must be an auditable,
  retryable job with idempotency and centre-visible failure state.

## Decision: Use opaque, single-record, seven-day guardian links

**Rationale**: A link must grant the minimum access needed for one approved session, resource,
invoice, or receipt. The URL MUST contain an opaque random token or equivalent reference, never
student names, notes, invoice details, or predictable identifiers. The server resolves the token to
an active access-link record, checks expiry, revocation, centre scope, relationship verification,
consent, and record visibility, then renders a phone-first page. Links expire seven days after
sending and can be revoked or replaced.

**Alternatives considered**:

- A broad parent dashboard is rejected because it increases disclosure if a link is forwarded.
- Permanent links are rejected because MVP access has no parent login.
- Storing sensitive data directly in the URL is rejected because URLs leak through browser history,
  referrers, screenshots, and message forwarding.

## Decision: Require centre relationship confirmation plus one-time number confirmation

**Rationale**: The centre is responsible for confirming the guardian-to-student relationship, while
one-time code confirmation proves control of the WhatsApp number without creating a parent account.
Protected messages remain blocked until both conditions are true. Verification attempts, expiry,
revocation, and recovery actions are auditable.

**Alternatives considered**:

- Centre-only confirmation cannot prove that the recipient controls the number.
- Number-only confirmation cannot prove the person is an authorized guardian for the student.
- A permanent parent account is out of MVP scope and adds password recovery and account lifecycle
  complexity.

## Decision: Apply separate centrally defined retention classes

**Rationale**: Student/session data, billing records, and audit events have different minimization,
legal, and security needs. The data model stores retention class and deletion eligibility, while a
centrally managed policy supplies exact durations before production. Deletion and export operations
are audited and backups follow the same documented retention policy.

**Alternatives considered**:

- One global retention period would retain child data longer than necessary or delete financial and
  security evidence too early.
- Centre-selected retention periods are deferred because centres cannot override legal or platform
  minimums in the MVP.

## Decision: Use explicit state transitions and provider idempotency

**Rationale**: Sessions, invoices, payments, access links, notifications, consent, and verification
all have meaningful states. State changes must be explicit, auditable, and validated by role. External
message callbacks and retries must use stable provider event identifiers so duplicate delivery events
cannot create duplicate notifications, payments, or audit records.

**Alternatives considered**:

- Implicit boolean flags do not capture review, expiry, revocation, retry, dispute, or recovery paths.
- Trusting provider callbacks without idempotency risks duplicate messages and incorrect delivery state.
