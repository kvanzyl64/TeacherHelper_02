# Implementation Plan: Teacher Helper MVP Platform

**Branch**: `001-teacher-helper-mvp` | **Date**: 2026-09-25 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-teacher-helper-mvp/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Deliver a mobile-first, multi-tenant web platform for small South African tutoring centres. The
MVP covers centre onboarding, role-scoped student and tutor records, session logging, passwordless
single-record guardian links delivered through verified WhatsApp, ZAR term invoicing with manual
payment records, and centre oversight. The initial design uses a TypeScript web application deployed
on an Oracle Cloud compute server, self-hosted PostgreSQL with row-level tenant policies, protected
storage, structured audit events, and an adapter boundary around WhatsApp delivery. The database is
provisioned locally before application development. Development runs against a live local PostgreSQL
database until deployment, when PostgreSQL is installed on the Oracle Cloud compute server and the
application is deployed and tested there.

The web experience follows the project design guide in [Web Design pricipals.md](Web%20Design%20pricipals.md).
It uses the existing accessible line-art characters and shared SVG icon sprite in
`apps/web/public/images/line-art/` for role-oriented guidance, empty and success states, navigation,
actions, and status cues. Character animation remains subtle and respects reduced-motion preferences;
icons retain the shared stroke and restrained accent system.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x on the current supported Node.js LTS

**Primary Dependencies**: Next.js App Router, PostgreSQL 16 or the current supported PostgreSQL
release installed locally during development and installed on the Oracle Cloud compute server at
deployment, with row-level security, managed authentication, protected storage, a WhatsApp Business
messaging provider, a PDF document service, and a structured logging/error-monitoring service. Provider
adapters MUST isolate vendor-specific behavior from domain workflows. No Oracle Cloud managed SQL
service is required or used.

**Storage**: Self-hosted PostgreSQL for tenant-scoped relational data, running locally during
development and on the Oracle Cloud server after deployment; private S3-compatible object storage
hosted on the Oracle server for resources, invoice documents, and exports; environment-specific
secrets storage for provider credentials. Object storage MUST use private buckets, server-side
encryption, signed temporary access, and backup coverage. Development, staging, and production use
separate PostgreSQL databases and credentials, with production access restricted to deployment and
operations roles.

**Testing**: Unit and domain tests with Vitest, browser workflow tests with Playwright, contract tests
for WhatsApp and document delivery adapters, database authorization tests for row-level policies, and
staging end-to-end tests covering the MVP journeys.

**Target Platform**: Local development with PostgreSQL, followed by an Oracle Cloud compute server
running the web application and PostgreSQL service for desktop and mobile browsers; no native mobile
application in MVP. Development, staging, and production MUST be separate environments and database
credentials.

**Project Type**: Multi-tenant web application with server-rendered and browser-interactive workflows
and provider-backed background delivery.

**Design System**: The implementation MUST follow [Web Design pricipals.md](Web%20Design%20pricipals.md)
for typography, colour, spacing, surfaces, borders, responsive layouts, interaction states, motion,
and focus treatment. Shared icons MUST use the SVG sprite at
`apps/web/public/images/line-art/icons.svg` with accessible names for icon-only controls. Existing
role-oriented character assets MUST be used selectively for onboarding, empty, success, and guidance
states, retain their accessible metadata, and preserve `prefers-reduced-motion` behaviour. Artwork
MUST remain secondary to task content and MUST NOT obscure safeguarding, permission, billing, or
recovery information.

**Performance Goals**: 95% of approved session messages produce an openable WhatsApp link within five
minutes; guardian pages and centre dashboard interactions target p95 response under 500 ms at pilot
load; invoice generation for a pilot centre completes within 30 minutes of operator effort.

**Constraints**: Every protected operation MUST enforce centre and role scope through application and
database policy. Guardian links are single-record, expire after seven days, require relationship and
one-time WhatsApp-number confirmation, and MUST NOT expose sensitive data in the link itself. MVP
delivery uses WhatsApp retries and centre alerting without automatic SMS/email fallback. Database
changes MUST use expand-then-contract migrations with backup and recovery procedures. Development
MUST use the live local `teacher_helper_dev` database with synthetic data only until deployment. At
deployment, PostgreSQL MUST be installed and secured on the Oracle Cloud compute server, the schema
MUST be migrated there, and application smoke/integration testing MUST begin from the deployed server.
Production data MUST never be copied into development.

**Scale/Scope**: Five pilot centres in the first term, with an initial design target of 100 centres,
50,000 active students, 2,000 tutors, and 500,000 session records without changing tenant or audit
boundaries. MVP excludes full scheduling, automated online payment reconciliation, advanced analytics,
full white-label customization, and native apps.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Tenant isolation and least privilege**: PASS. Tenant identity and role scope are first-class in
  domain records, request context, database policies, file paths, provider jobs, and tests.
- **Privacy and safeguarding**: PASS. Guardian relationship confirmation, one-time number confirmation,
  consent, single-record links, expiry, revocation, retention classes, exports, and audit events are
  required design elements.
- **Human-controlled AI**: PASS by scope. AI planning is explicitly excluded from the MVP delivery
  slice; later AI work must use the constitution’s approval and audit gates.
- **Testable and observable delivery**: PASS. Unit, integration, authorization, provider-contract,
  browser, migration, audit, backup, and staging checks are included in the design.
- **Accessible and reliable workflows**: PASS. Guardian pages are phone-first; failed delivery,
  expired links, provider outages, backups, recovery, and rollback are represented in workflows.
  The design guide, accessible icon sprite, character metadata, and reduced-motion behaviour provide
  consistent visual cues without making motion or artwork necessary to complete a task.
- **Security and operational constraints**: PASS. Managed authentication, self-hosted PostgreSQL
  row-level policy, protected storage, secrets, monitoring, backups, rate limits, and incident
  escalation are included. Local PostgreSQL access during development and the server firewall,
  PostgreSQL network binding, roles, and database separation at deployment MUST prevent public database
  access and development-to-production access.
- **Delivery and quality gates**: PASS. The structure supports protected branches, CI, staged release,
  immutable artifacts, migration discipline, review, and production approval.

No constitution violations require a complexity exception.

## Project Structure

### Documentation (this feature)

```text
specs/001-teacher-helper-mvp/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
├── Web Design pricipals.md # Shared visual, icon, and character guidance
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
apps/
└── web/
  ├── app/                 # Route groups for centre, tutor, guardian links, and auth
  ├── components/          # Shared accessible UI and phone-first page components
  ├── features/            # Domain slices: onboarding, people, sessions, billing, oversight
  ├── lib/                 # Auth, tenant context, validation, provider clients, observability
  ├── public/images/line-art/ # Shared SVG icon sprite and animated role characters
  └── tests/               # Browser and route-level tests

packages/
├── domain/                  # Pure entities, policies, state transitions, and use cases
├── database/                # Schema, row-level policies, migrations, seed data, policy tests
├── integrations/            # WhatsApp, document, storage, and monitoring adapters
└── test-support/            # Fixtures and isolated tenant test helpers

tests/
├── contract/                # Provider and public workflow contracts
├── integration/             # Database, authorization, storage, and delivery flows
└── e2e/                     # Centre, tutor, guardian, and invoice journeys

infra/
├── oracle-cloud/             # Compute server bootstrap, firewall, deployment, and recovery docs
└── postgres/                 # PostgreSQL service config, database roles, init, backup, and restore
```

**Structure Decision**: Use a single web application plus domain, database, integration, test, Oracle
Cloud, and PostgreSQL infrastructure directories in one repository. Provision local PostgreSQL and
the local `teacher_helper_dev` database before application setup. During deployment, install
PostgreSQL on the Oracle compute server, create separate staging and production databases, migrate
the schema, deploy the application, and run smoke/integration tests from the server. Never use
production data in development. This keeps the MVP lightweight while preserving tenant
authorization and operational boundaries.

## Complexity Tracking

No entries. The selected structure does not violate the constitution.
