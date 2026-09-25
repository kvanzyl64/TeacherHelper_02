<!--
Sync Impact Report
- Version change: 1.0.0 -> 2.0.0
- Modified principles: Security and Operational Constraints (managed database requirement broadened
	to permit self-hosted PostgreSQL-compatible storage with equivalent controls)
- Added sections: none
- Removed sections: none
- Follow-up TODOs: original ratification date is unknown and remains marked below
-->

# Teacher Helper Constitution

## Core Principles

### I. Tenant Isolation and Least Privilege
Every request, query, file operation, report, notification, and background job MUST be
authorized for both the acting role and the centre tenant. Data from one centre MUST NOT be
observable or mutable by another centre. Access MUST be limited to the minimum information
and actions needed for the user’s workflow, with Super Admin access separately controlled and
audited. This is non-negotiable because the product is a multi-tenant system handling student,
family, billing, and tutor records.

### II. Privacy and Safeguarding by Design
Student and guardian data, communications, files, consent, and learning records MUST be
protected in transit and at rest. Features handling children MUST define visibility, consent,
retention, export, deletion, and escalation behavior before release. The implementation MUST
support POPIA-aligned controls and document any applicable GDPR or COPPA assessment. Sensitive
communication MUST remain within permitted relationships and MUST provide an auditable path for
concerns and incidents.

### III. Human-Controlled AI
AI output MUST be clearly identified as a suggestion and MUST NOT become final educational
content or be shared with a parent without an authorized tutor or administrator reviewing and
approving it. Tutors MUST be able to edit, reject, override, and report unsuitable output.
Systems MUST use only authorized student context and MUST retain an audit record of the
suggestion, decision, edits, and resulting use. This preserves professional judgment and gives
centres a traceable response when generated content is wrong or harmful.

### IV. Testable, Observable Delivery
Every user-visible workflow and security boundary MUST have automated tests at the narrowest
useful level, with integration tests for tenant authorization, identity, billing, notifications,
file access, migrations, and external-provider contracts. Deployments MUST run linting, tests,
build validation, health checks, and staging end-to-end checks where applicable. Production
behavior MUST emit structured audit and operational signals for access, administrative, billing,
security, AI, failure, and recovery events. Untested or unobservable critical behavior MUST NOT
be released.

### V. Accessible and Reliable Workflows
MVP workflows MUST be usable on mobile and desktop browsers, support the defined centre, parent,
tutor, and administrator roles, and communicate state clearly for attendance, sessions, invoices,
payments, notifications, and escalations. Product behavior MUST favor simple, recoverable flows
over hidden automation: records require explicit status, failures require actionable feedback,
and destructive actions require appropriate confirmation or recovery. Changes MUST preserve
backwards-compatible data migrations, backups, rollback capability, and documented recovery
procedures.

## Security and Operational Constraints

The initial architecture MUST use managed authentication and either a managed or self-hosted
PostgreSQL-compatible database with tenant-aware row-level access controls, protected object
storage, secrets management, monitoring, and daily incremental backups. A self-hosted database
MUST run on a supported version, use least-privilege roles, private network binding, firewall
restrictions, encrypted connections where supported, security patching, monitored capacity, and
documented backup and restore procedures. Tenant exports, retention, deletion, point-in-time
recovery where available, and disaster recovery MUST be documented and tested. Rate limits MUST
account for tenant and subscription limits. Suspected isolation breaches, security incidents,
failed backups, elevated errors, and unhealthy services MUST be escalated to the responsible
platform administrators immediately.

## Delivery and Quality Gates

Changes MUST be delivered through protected `main` and `staging` branches using short-lived
feature branches, pull requests, review, and required CI checks. Production deployments MUST
require explicit approval and immutable release artifacts. Database changes MUST use an
expand-then-contract approach with a pre-deployment backup and a tested rollback or recovery
path. Reviewers MUST verify constitution compliance, tenant and child-data impact, test coverage,
observability, accessibility, and documentation before approval.

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

This constitution is the governing standard for product and engineering decisions. Amendments
MUST be proposed in a pull request with the affected principles, rationale, migration impact,
and updated version and dates. The project owner and an engineering reviewer MUST approve
amendments; security, privacy, or safeguarding changes additionally require review by the
responsible security or compliance owner. Every feature plan and pull request MUST identify its
constitution obligations and record any justified exception with an owner and expiry.

Versioning follows semantic versioning: MAJOR for incompatible governance or principle changes,
MINOR for new principles or materially expanded requirements, and PATCH for clarifications or
non-semantic corrections. Compliance MUST be reviewed during planning, code review, release
readiness, and incident follow-up. The constitution MUST be revisited at least once per release
cycle and after any material security, privacy, or safeguarding incident.

**Version**: 2.0.0 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date is unknown | **Last Amended**: 2026-09-25
