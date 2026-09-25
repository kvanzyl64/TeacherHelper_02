# Teacher Helper

Teacher Helper is a planned multi-tenant SaaS platform for South African afterschool and tutoring
centres. It will support centre administration, student and tutor records, session updates,
passwordless guardian communication, invoicing, manual payment records, and operational oversight.

## Current Status

The project is currently in the specification and implementation-planning phase. Application source
code has not been implemented yet.

Completed planning artifacts:

- [Product specification](TeacherHelperSpec.md)
- [Feature specification](specs/001-teacher-helper-mvp/spec.md)
- [Implementation plan](specs/001-teacher-helper-mvp/plan.md)
- [Research decisions](specs/001-teacher-helper-mvp/research.md)
- [Data model](specs/001-teacher-helper-mvp/data-model.md)
- [Quickstart validation guide](specs/001-teacher-helper-mvp/quickstart.md)
- [Implementation tasks](specs/001-teacher-helper-mvp/tasks.md)
- [Project constitution](.specify/memory/constitution.md)

## MVP Scope

The first release is planned to include:

- Centre onboarding and isolated tenant workspaces
- Owner, administrator, and tutor authentication and permissions
- Student, guardian, tutor assignment, consent, and verification records
- Session logging with review and approval states
- Automated WhatsApp messages with secure, single-record guardian links
- Seven-day passwordless guardian links that render on phone screens
- Term invoices in South African Rand
- Manual EFT, cash, and other payment records
- Centre dashboards, audit events, exports, backups, and recovery procedures

Full scheduling, automated online payment reconciliation, advanced analytics, full white-labeling,
native mobile applications, and AI educational content are outside the MVP scope.

## Planned Architecture

- TypeScript and Next.js web application
- PostgreSQL with row-level tenant security
- Local PostgreSQL during development using a live `teacher_helper_dev` database
- PostgreSQL installed on the Oracle Cloud compute server at deployment
- Private S3-compatible object storage for resources, invoice documents, and exports
- WhatsApp Business provider adapter with retries and delivery tracking
- Vitest, Playwright, database policy tests, provider contract tests, and staging tests

SQLite is not the project database because the multi-tenant SaaS requires PostgreSQL row-level
security and stronger concurrent write behavior.

## Development Workflow

1. Install and secure local PostgreSQL.
2. Create the local `teacher_helper_dev` database and least-privilege development roles.
3. Use synthetic data only during development.
4. Implement the tasks in [tasks.md](specs/001-teacher-helper-mvp/tasks.md).
5. Run the local validation scenarios in [quickstart.md](specs/001-teacher-helper-mvp/quickstart.md).
6. At deployment, install PostgreSQL and private object storage on the Oracle Cloud server.
7. Create staging and production databases, migrate the schema, deploy the application, and run
   smoke and integration tests from the server.

Production data and credentials must never be copied into local development.

## Repository Layout

```text
.specify/                         Spec Kit configuration and workflows
.github/skills/                   Project workflow skills
specs/001-teacher-helper-mvp/     Feature design and implementation artifacts
TeacherHelperSpec.md              Original product brief
```

## Implementation

Use the ordered tasks in [tasks.md](specs/001-teacher-helper-mvp/tasks.md). The recommended first
milestone is the foundational database and tenant-isolation work followed by User Story 1 onboarding.

The project constitution is the governing standard for security, privacy, testing, observability,
accessibility, deployment, and recovery decisions.
