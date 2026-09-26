# Feature Specification: SaaS Admin

**Feature Branch**: `[003-saas-admin]`

**Created**: 2026-09-26

**Status**: Draft

**Input**: User description: "what we need for saas admin, with a live database, a provisioned SaaS owner account, and every data-bearing screen connected to persistent storage from the start"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Monitor the SaaS health and customer portfolio (Priority: P1)

A SaaS owner needs a single, trusted view of the business: active centres, recent signups, current subscriptions, recent failures, and any operational risks affecting customer service. This view helps the owner understand whether the platform is healthy and where intervention is needed before a small issue becomes a customer outage.

**Why this priority**: Without a reliable portfolio and health overview, the owner cannot judge whether the SaaS is stable, which customers may need attention, or where service issues are concentrated.

**Independent Test**: A SaaS owner can open the admin overview, review active centres, subscription status, alerts, and service health indicators, and understand which items need immediate action.

**Acceptance Scenarios**:

1. **Given** a SaaS owner with access to the platform administration area, **When** they open the admin dashboard, **Then** they can see a summary of overall centre count, active subscriptions, active trials, and recent service or customer-impact alerts.
2. **Given** the platform has several centres in different states, **When** the owner reviews the portfolio view, **Then** they can distinguish active, trial, paused, suspended, and flagged centres without seeing unrelated child or billing records from a single centre.
3. **Given** a centre has a recent operational problem, **When** the owner clicks from the dashboard summary into the centre details, **Then** they can see the context needed to determine whether it is a product issue, a billing issue, or a customer support issue.

---

### User Story 2 - Track payments, subscription health, and revenue signals (Priority: P1)

A SaaS owner needs to understand which centres are paying on time, which are behind, which plans are being used, and which customers need follow-up before their service is interrupted. This gives the business a clear operational view for cash flow, churn risk, and support follow-up without exposing sensitive billing details to unrelated users.

**Why this priority**: Subscription and payment visibility is essential for SaaS operations, financial discipline, and customer retention. A platform without this view cannot reliably manage commercial risk.

**Independent Test**: A SaaS owner can open the payment and subscription views to review payments, overdue balances, plan usage, and centre status, and identify who needs action.

**Acceptance Scenarios**:

1. **Given** a centre has an active subscription and recent payments, **When** the owner opens the billing overview, **Then** they can see current plan, billing status, last successful payment, and any outstanding follow-up items.
2. **Given** a centre is in arrears or has a failed payment, **When** the owner reviews the payment list, **Then** they can see the issue, the amount involved, and the relevant centre without exposing unrelated billing records.
3. **Given** the owner wants to understand financial performance, **When** they view revenue summaries and plan adoption, **Then** they can compare active, trial, and at-risk centres using aggregated metrics that reflect business status rather than individual child data.

---

### User Story 3 - Resolve operational escalations and protect tenant boundaries (Priority: P2)

A SaaS owner needs a controlled path to investigate service failures, support escalations, data retention issues, and recoverable operational events, while protecting centre confidentiality and enforcing role-based access. In the first release only the explicitly provisioned platform owner can access cross-centre administration. Read-only support access is deferred and is not an enabled role in this release.

**Why this priority**: Trust and safety are central to a multi-tenant SaaS. Operational follow-up must be secure, auditable, and respectful of tenant boundaries.

**Independent Test**: The SaaS owner can open a flagged centre or operational alert, review the safe summary, and identify the required action while confirming they are not seeing protected child or billing records beyond the permitted scope.

**Acceptance Scenarios**:

1. **Given** a centre has a failed export, missed backup, or support escalated issue, **When** the owner opens the operational alert, **Then** they can see the issue type, affected centre, time, and recommended recovery action without exposing unrelated centre content.
2. **Given** a centre user or unassigned identity attempts to access the SaaS admin area, **When** authorization is evaluated, **Then** access is denied and no cross-centre summary is returned.
3. **Given** a platform-level or centre identity attempts access outside its authorized scope, **When** the action is evaluated, **Then** it is denied and recorded so that only the explicitly provisioned SaaS owner can review cross-centre information in the first release.
4. **Given** the owner resolves a customer issue or payment follow-up, **When** the action is recorded, **Then** the event is auditable and visible in the relevant operational or billing history for follow-up and review.

---

### Edge Cases

- What happens when a centre is suspended or trial expired but still has active student data?
- How does the system handle a failed or duplicate payment event without creating false revenue narrative?
- What happens when a support case needs access to a centre with sensitive records while the SaaS owner is not explicitly authorised for that tenant?
- How are stale or failed exports, backup issues, and retention warnings surfaced without overwhelming the owner with low-value noise?

### User Story 4 - Use persistent data across product screens (Priority: P1)

Centre owners, administrators, tutors, guardians, and the platform owner need every data-bearing screen and action to read and write the PostgreSQL records defined for its workflow. This prevents the product from presenting demo values or losing changes when a request ends, and makes authorization and data persistence testable end to end.

**Why this priority**: Database persistence, identity, and tenant scope are foundational product behavior. A screen backed by fixtures or an in-memory repository is not a working business workflow.

**Independent Test**: Against a dedicated local PostgreSQL database populated only with synthetic records, create or update a record through an authorized workflow, navigate or make a fresh request, and verify the persisted result. Repeat with a different centre, role, expired guardian link, and denied identity to prove that records remain isolated.

**Acceptance Scenarios**:

1. **Given** local PostgreSQL is running with the expected migration state, **When** the app or a DB-backed workflow starts without its configured application `DATABASE_URL`, **Then** it fails with an actionable configuration error rather than silently serving demo data.
2. **Given** a staff member creates or updates an authorized centre record, **When** a later request reloads the relevant page, **Then** the page displays the persisted database value and not an in-memory or bundled fixture.
3. **Given** a user requests a tenant-owned record, **When** their authenticated identity, role, active membership, and transaction-local RLS context do not authorize that centre, **Then** the query returns no protected row and the UI gives a generic denial or unavailable state.
4. **Given** a guardian opens a passwordless link, **When** the link digest, expiry, relationship, consent, and requested record scope are not all valid, **Then** protected record data is not loaded or returned.
5. **Given** a migration, repository, or RLS behavior changes, **When** the PostgreSQL integration suite runs against the isolated synthetic-data test database, **Then** it verifies persistence, migration state, and both allowed and denied tenant access without connecting to development, staging, or production data.
6. **Given** a data-bearing route is implemented, **When** it is reviewed for release, **Then** it has a route-to-table mapping, server-side repository, identity/role/scope check, empty/failure states, and an automated PostgreSQL integration or authenticated workflow test.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST provide a dedicated SaaS administration area for platform owners to review tenant health, customer status, and operations across all centres.
- **FR-002**: The system MUST present portfolio-level summaries for active centres, trial centres, suspended centres, and recently changed customer states.
- **FR-003**: The system MUST make subscription and payment status visible at the SaaS level without exposing protected child, session, or family records beyond the authorised centre context.
- **FR-004**: The system MUST distinguish between active subscriptions, trials, overdue balances, failed payments, and at-risk accounts in a plain-language summary.
- **FR-005**: The system MUST provide a clear billing overview showing payment activity, outstanding amounts, and the centres requiring follow-up.
- **FR-006**: The system MUST provide operational alerts for failed exports, recovery issues, platform errors, retention concerns, or other service-impacting conditions that require owner action.
- **FR-007**: The system MUST allow a SaaS owner to view centre-level details necessary to resolve a service or payment issue while preserving tenant isolation.
- **FR-008**: In the first release, the system MUST deny SaaS administration access to support or operations identities; only an explicitly provisioned active `platform_owner` identity may review cross-centre summaries. Any later read-only support role requires a separate approved specification and must not enable tenant editing or access to sensitive child data.
- **FR-009**: The system MUST prevent access to records outside the acting user’s authorised tenant or role scope.
- **FR-010**: The system MUST retain auditable records for key platform actions, including payment follow-up, service recovery, and support escalation decisions.
- **FR-011**: The system MUST allow the owner to identify customer health trends over time, including signups, churn risk, and subscription stability, using business-safe summary metrics.
- **FR-012**: The system MUST surface platform and customer-impact summaries in a format that supports quick decision-making without exposing unnecessary detail.
- **FR-013**: The system MUST flag unresolved issues in a way that differentiates between operational risk, financial risk, and customer support risk.
- **FR-014**: Human account authentication for centre staff and platform administrators MUST use managed OIDC. The application MUST NOT store human account passwords or use the custom platform-admin password/session mechanism as its production authentication path. Guardian link access remains passwordless and relationship-scoped as specified by the guardian workflows.
- **FR-015**: Every data-bearing web route and Server Action MUST read or mutate its authoritative PostgreSQL records through a server-side repository/DAL. Runtime pages MUST NOT use demo fixture arrays or in-memory repositories as substitutes for persistence. Static marketing and generic error pages are exempt.
- **FR-016**: Every tenant-owned query and mutation MUST verify authenticated identity, active centre membership or assignment, role permission, and centre scope; establish tenant context transaction-locally; and rely on PostgreSQL RLS enforced under a non-owner, non-`BYPASSRLS` runtime role.
- **FR-017**: Platform-owner cross-centre queries MUST use a separately authorized platform-admin data path and return only business-safe DTOs. Platform access and denials MUST be audited; platform access MUST NOT be represented by a fabricated centre context.
- **FR-018**: The system MUST track ordered database migrations and detect schema drift. Existing databases MUST be backed up and reconciled before missing migrations or forward-only repairs are applied. Migration history MUST NOT be erased by test-data reset.
- **FR-019**: The system MUST provide a documented, audited bootstrap process that links one explicitly designated managed OIDC identity to the initial active `platform_owner` account. The bootstrap process MUST NOT create default passwords or credentials in source control.
- **FR-020**: Automated PostgreSQL integration tests MUST execute migrations against an isolated synthetic-data test database and verify persistence, identity, RLS allow/deny behavior, and repository workflows. Tests MUST refuse staging and production URLs and MUST NOT truncate the shared development database.
- **FR-021**: The SaaS subscription and payment model MUST be distinct from centre family tuition invoices and payments so platform revenue summaries cannot mix the two billing domains.

### Key Entities _(include if feature involves data)_

- **Centre**: A tenant or business account with a subscription, active status, contact information, and operational context.
- **Subscription**: The commercial relationship between the SaaS and a centre, including plan, renewal, and status.
- **Payment Event**: A payment or failed payment record tied to a centre and billing cycle.
- **Operational Alert**: A service or data issue requiring review, such as export failure, recovery problem, security concern, or retention risk.
- **SaaS Owner**: The platform-level user responsible for business and operational oversight across multiple centres.
- **Support Case**: A record of a customer issue or escalation with the centre and required follow-up actions.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A SaaS owner can review the platform portfolio and identify all centres requiring follow-up within a single admin session.
- **SC-002**: A SaaS owner can distinguish active, trial, overdue, failed-payment, and suspended centres using the admin summary without needing unsupported manual reporting.
- **SC-003**: 90% of platform owners can complete the primary admin overview and payment follow-up workflows without confusion or unnecessary support requests.
- **SC-004**: Every platform alert records creation time and, when applicable, acknowledgement and resolution times; the admin view shows severity and unresolved age. No response-time SLA is claimed until the platform owner approves an operational target.
- **SC-005**: The platform shows a clear view of revenue and subscription health for the SaaS owner without exposing unrelated learner, guardian, or student information.
- **SC-006**: All escalated operational and billing actions are recorded in an auditable trail suitable for review or support follow-up.
- **SC-007**: 100% of data-bearing routes in the page-data contract identify their PostgreSQL source, authorization boundary, and automated integration/workflow test before release approval.
- **SC-008**: The PostgreSQL integration suite can create, read, update, and isolate synthetic tenant data on a fresh migrated test database, and proves that a second tenant and unauthorized role cannot read or mutate the first tenant's protected records.
- **SC-009**: A platform owner can authenticate through the configured managed OIDC provider and reach SaaS admin only after an explicit active platform-owner mapping is provisioned; centre roles and unassigned identities are denied.

## Assumptions

- The SaaS owner is a separate, platform-level role distinct from centre owner and centre administrator roles.
- The initial release is owner-only for cross-centre SaaS administration. Read-only support/operations access is out of scope until separately specified and approved.
- The feature applies to multiple centres and requires tenant-aware access rules, not a single-centre dashboard.
- Existing commercial and billing data will be used for plan and payment summaries rather than creating a new billing system from scratch.
- Centre family tuition invoices and payments are not SaaS subscription revenue. If the current schema does not contain SaaS subscription records, add them through forward-only migrations before implementing platform revenue summaries.
- A managed OIDC provider and its development/test configuration must be selected and provisioned as an environment prerequisite; provider secrets are never committed.
- Data-bearing pages require PostgreSQL-backed repositories from their first implementation, not a later fixture-to-database retrofit.
- The service will prioritize operational clarity and low-risk oversight over broad data browsing.
- Access to sensitive child, guardian, and student records remains restricted to the centre and required authorised roles, even within the platform administration workflow.
