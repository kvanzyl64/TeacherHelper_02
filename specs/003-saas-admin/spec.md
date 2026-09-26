# Feature Specification: SaaS Admin

**Feature Branch**: `[003-saas-admin]`

**Created**: 2026-09-26

**Status**: Draft

**Input**: User description: "what we need for saas admin"

## User Scenarios & Testing *(mandatory)*

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

A SaaS owner needs a controlled path to investigate service failures, support escalations, data retention issues, and recoverable operational events, while protecting centre confidentiality and enforcing role-based access. This allows the owner to respond to incidents without letting support or platform operations become a privacy risk. In the first release, only the platform owner has direct access to the SaaS admin area, while limited support or operations staff may be allowed read-only access to business summaries and alerts, but not to edit tenant data or sensitive records.

**Why this priority**: Trust and safety are central to a multi-tenant SaaS. Operational follow-up must be secure, auditable, and respectful of tenant boundaries.

**Independent Test**: The SaaS owner can open a flagged centre or operational alert, review the safe summary, and identify the required action while confirming they are not seeing protected child or billing records beyond the permitted scope.

**Acceptance Scenarios**:

1. **Given** a centre has a failed export, missed backup, or support escalated issue, **When** the owner opens the operational alert, **Then** they can see the issue type, affected centre, time, and recommended recovery action without exposing unrelated centre content.
2. **Given** a read-only support or operations user accesses the SaaS admin area, **When** they review summaries or alerts, **Then** they can see business-safe operational status but cannot edit centre data, billing records, or protected child information.
3. **Given** a platform-level member attempts access outside of their authorised scope, **When** the action is evaluated, **Then** it is denied and recorded so that only approved SaaS owner or read-only support workflows can review cross-centre information.
4. **Given** the owner resolves a customer issue or payment follow-up, **When** the action is recorded, **Then** the event is auditable and visible in the relevant operational or billing history for follow-up and review.

---

### Edge Cases

- What happens when a centre is suspended or trial expired but still has active student data?
- How does the system handle a failed or duplicate payment event without creating false revenue narrative?
- What happens when a support case needs access to a centre with sensitive records while the SaaS owner is not explicitly authorised for that tenant?
- How are stale or failed exports, backup issues, and retention warnings surfaced without overwhelming the owner with low-value noise?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a dedicated SaaS administration area for platform owners to review tenant health, customer status, and operations across all centres.
- **FR-002**: The system MUST present portfolio-level summaries for active centres, trial centres, suspended centres, and recently changed customer states.
- **FR-003**: The system MUST make subscription and payment status visible at the SaaS level without exposing protected child, session, or family records beyond the authorised centre context.
- **FR-004**: The system MUST distinguish between active subscriptions, trials, overdue balances, failed payments, and at-risk accounts in a plain-language summary.
- **FR-005**: The system MUST provide a clear billing overview showing payment activity, outstanding amounts, and the centres requiring follow-up.
- **FR-006**: The system MUST provide operational alerts for failed exports, recovery issues, platform errors, retention concerns, or other service-impacting conditions that require owner action.
- **FR-007**: The system MUST allow a SaaS owner to view centre-level details necessary to resolve a service or payment issue while preserving tenant isolation.
- **FR-008**: The system MUST allow limited read-only support or operations users to review business-safe summaries and alerts only when explicitly assigned, without enabling editing access to tenant records or sensitive child data.
- **FR-009**: The system MUST prevent access to records outside the acting user’s authorised tenant or role scope.
- **FR-010**: The system MUST retain auditable records for key platform actions, including payment follow-up, service recovery, and support escalation decisions.
- **FR-011**: The system MUST allow the owner to identify customer health trends over time, including signups, churn risk, and subscription stability, using business-safe summary metrics.
- **FR-012**: The system MUST surface platform and customer-impact summaries in a format that supports quick decision-making without exposing unnecessary detail.
- **FR-013**: The system MUST flag unresolved issues in a way that differentiates between operational risk, financial risk, and customer support risk.

### Key Entities *(include if feature involves data)*

- **Centre**: A tenant or business account with a subscription, active status, contact information, and operational context.
- **Subscription**: The commercial relationship between the SaaS and a centre, including plan, renewal, and status.
- **Payment Event**: A payment or failed payment record tied to a centre and billing cycle.
- **Operational Alert**: A service or data issue requiring review, such as export failure, recovery problem, security concern, or retention risk.
- **SaaS Owner**: The platform-level user responsible for business and operational oversight across multiple centres.
- **Support Case**: A record of a customer issue or escalation with the centre and required follow-up actions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A SaaS owner can review the platform portfolio and identify all centres requiring follow-up within a single admin session.
- **SC-002**: A SaaS owner can distinguish active, trial, overdue, failed-payment, and suspended centres using the admin summary without needing unsupported manual reporting.
- **SC-003**: 90% of platform owners can complete the primary admin overview and payment follow-up workflows without confusion or unnecessary support requests.
- **SC-004**: Platform alerts are reviewed and responded to within a defined operational target for critical issues without creating cross-tenant data exposure.
- **SC-005**: The platform shows a clear view of revenue and subscription health for the SaaS owner without exposing unrelated learner, guardian, or student information.
- **SC-006**: All escalated operational and billing actions are recorded in an auditable trail suitable for review or support follow-up.

## Assumptions

- The SaaS owner is a separate, platform-level role distinct from centre owner and centre administrator roles.
- The initial release is owner-first and intentionally narrow: direct access is reserved to the platform owner, while read-only support or operations users may be added later with explicit permission boundaries.
- The feature applies to multiple centres and requires tenant-aware access rules, not a single-centre dashboard.
- Existing commercial and billing data will be used for plan and payment summaries rather than creating a new billing system from scratch.
- The service will prioritize operational clarity and low-risk oversight over broad data browsing.
- Access to sensitive child, guardian, and student records remains restricted to the centre and required authorised roles, even within the platform administration workflow.
