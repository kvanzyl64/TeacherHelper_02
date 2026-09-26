---

description: "Executable implementation tasks for the Teacher Helper SaaS admin feature"
---

# Tasks: SaaS Admin

**Input**: Design documents from `/specs/003-saas-admin/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included because the specification defines explicit owner dashboard, billing, support-access, and tenant-isolation validation scenarios.

**Organization**: Tasks are grouped by user story so each admin route slice can be implemented and demonstrated independently.

## Phase 1: Setup (Shared Platform Admin Infrastructure)

**Purpose**: Establish the shared admin route shell, data model, and service contracts used by every SaaS admin page.

- [ ] T001 [P] Define platform-admin route metadata, navigation entries, and shared admin layout contracts in `apps/web/app/(admin)/layout.tsx`, `apps/web/components/navigation/admin-navigation.tsx`, and `apps/web/lib/auth/roles.ts`.
- [ ] T002 [P] Add the platform admin domain models for portfolio, billing, and alerts in `packages/domain/src/admin/portfolio.ts`, `packages/domain/src/admin/billing.ts`, and `packages/domain/src/admin/alerts.ts` using the constraints from `specs/003-saas-admin/data-model.md`.
- [ ] T003 [P] Create admin-facing service stubs and integration boundaries in `apps/web/features/admin/`, `apps/web/lib/auth/permissions.ts`, and `packages/integrations/src/admin/` for dashboard summaries, payment status, and alert queries.

## Phase 2: Foundational (Blocking Access and Policy Boundaries)

**Purpose**: Make platform-owner and read-only support access rules available before any dashboard or centre detail work begins.

- [ ] T004 Add platform-admin authorization checks and route-level role enforcement in `apps/web/lib/auth/route-guards.ts` and `apps/web/app/(admin)/layout.tsx` so only approved platform roles can access the admin route family.
- [ ] T005 Add read-only support permission handling and generic forbidden states in `apps/web/lib/auth/permissions.ts` and `apps/web/app/(admin)/forbidden/page.tsx` without exposing protected tenant data.
- [ ] T006 Add shared aggregation helpers for dashboard metrics in `packages/domain/src/admin/dashboard-summary.ts` and `packages/domain/src/admin/metrics.ts`, ensuring active centres, trial centres, overdue centres, and open alerts are computed from business-safe values only.
- [ ] T007 Add admin contract coverage for route access and content boundaries in `tests/contract/platform-admin.contract.test.ts` using `specs/003-saas-admin/contracts/platform-admin-ui.md`.
- [ ] T008 Add admin browser helpers and page fixtures in `tests/e2e/admin-helpers.ts` for viewport, focus, and role-based route validation.

## Phase 3: User Story 1 - Monitor the SaaS health and customer portfolio (Priority: P1)

**Goal**: A SaaS owner can open a single, trusted portfolio view that shows centre health, triage signals, and immediate action items without revealing protected child or tenant detail.

**Independent Test**: A platform owner can open the admin overview, review centre count, subscription health, alert count, and at-risk items, and understand which centres need action.

### Tests for User Story 1

- [ ] T009 [P] [US1] Add dashboard browser coverage in `tests/e2e/admin-dashboard.spec.ts` to verify active centres, trial centres, overdue counts, open alerts, and navigation to finance and alerts views.
- [ ] T010 [P] [US1] Add portfolio contract assertions in `tests/contract/platform-admin.contract.test.ts` for totals, summary cards, and safe business-only content in the admin dashboard.

### Implementation for User Story 1

- [ ] T011 [US1] Implement the platform overview route in `apps/web/app/(admin)/page.tsx` with portfolio summary cards and safe centre-level links.
- [ ] T012 [US1] Build the reusable admin summary card and section components in `apps/web/components/admin/portfolio-summary.tsx` and `apps/web/components/admin/alert-summary.tsx`.
- [ ] T013 [US1] Connect the route to the dashboard service output in `packages/integrations/src/admin/dashboard.ts` and `apps/web/features/admin/dashboard.ts` so summary metrics are sourced from the existing multi-tenant domain without leaking protected records.

## Phase 4: User Story 2 - Track payments, subscription health, and revenue signals (Priority: P1)

**Goal**: A SaaS owner can review current subscription health, overdue balances, plan adoption, and payment follow-up items at the portfolio level.

**Independent Test**: A SaaS owner can open the payment and subscription views to review plan usage, overdue balances, and centres needing follow-up without seeing unrelated billing records.

### Tests for User Story 2

- [ ] T014 [P] [US2] Add billing overview browser tests in `tests/e2e/admin-billing.spec.ts` for overdue balances, failed payments, and plan adoption states.
- [ ] T015 [P] [US2] Add revenue and payment summary assertions in `tests/contract/platform-admin.contract.test.ts` covering billing status, overdue count, and centre follow-up actions.

### Implementation for User Story 2

- [ ] T016 [US2] Implement the billing overview route in `apps/web/app/(admin)/billing/page.tsx` with subscription health, overdue centres, and action links for follow-up.
- [ ] T017 [US2] Build the billing table and status badge components in `apps/web/components/admin/billing-overview.tsx` and `apps/web/components/admin/subscription-status.tsx`.
- [ ] T018 [US2] Add billing aggregation logic in `packages/domain/src/admin/billing-summary.ts` and `packages/integrations/src/admin/billing.ts` so payment data remains centre-scoped and currency-aware while using business-safe summaries.

## Phase 5: User Story 3 - Resolve operational escalations and protect tenant boundaries (Priority: P2)

**Goal**: The SaaS owner can review platform alerts and a safe centre-level detail view, while read-only support staff can inspect summaries only and cannot alter tenant records.

**Independent Test**: The SaaS owner can open a flagged centre or operational alert, review the safe summary, and confirm read-only support access is denied for edit or protected tenant actions.

### Tests for User Story 3

- [ ] T019 [P] [US3] Add alert and access browser coverage in `tests/e2e/admin-alerts.spec.ts` for open alerts, severity labels, read-only support visibility, and denied edits.
- [ ] T020 [P] [US3] Add tenant isolation contract assertions in `tests/contract/platform-admin.contract.test.ts` for out-of-scope centre access and safe detail content.

### Implementation for User Story 3

- [ ] T021 [US3] Implement the platform alerts route in `apps/web/app/(admin)/alerts/page.tsx` with severity, status, affected centre, timestamps, and follow-up summary.
- [ ] T022 [US3] Implement the centre detail route in `apps/web/app/(admin)/centres/[centreId]/page.tsx` with safe business contact information, payment risk, and open alerts only.
- [ ] T023 [US3] Add alert and support-case domain models and service mapping in `packages/domain/src/admin/alerts.ts`, `packages/domain/src/admin/support-cases.ts`, and `apps/web/features/admin/alerts.ts` while excluding child, guardian, and session detail from the page context.
- [ ] T024 [US3] Record auditable admin actions and access denials in `packages/domain/src/audit/admin-events.ts` and the relevant admin action handlers so escalations and recoveries remain reviewable.

## Phase 6: Final Polish and Cross-Cutting Validation

**Purpose**: Prove the admin routes, access model, and metrics remain safe, testable, and compliant with the project constitution.

- [ ] T025 [P] Run the targeted admin and contract suite across `tests/contract/`, `tests/integration/`, and `packages/domain/src/` to validate tenant isolation, billing risk, and platform summary behavior.
- [ ] T026 [P] Run the repository lint, typecheck, and production build and record the results in `specs/003-saas-admin/quickstart.md`.
- [ ] T027 Validate the platform-owner and read-only support quickstart scenarios in `specs/003-saas-admin/quickstart.md` for dashboard, billing, alert review, and denied access flows.
- [ ] T028 Review the final SaaS admin implementation against the constitution in `specs/003-saas-admin/quickstart.md` and confirm least privilege, tenant isolation, privacy, and audit evidence.

## Dependencies and Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001-T003 can run in parallel because they add separate route metadata, domain types, and service stubs without depending on page-level work.
- **Foundational (Phase 2)**: T004-T006 depend on the admin route shell and shared metrics model; T007-T008 can run after the access assumptions are defined.
- **US1 (Phase 3)**: Depends on Phase 2. T009-T010 can run in parallel; T011-T013 are sequential because they share the dashboard route and summary data flow.
- **US2 (Phase 4)**: Depends on Phase 2 and the billing domain model. T014-T015 can run in parallel; T016-T018 are sequential around the billing page and summary computation.
- **US3 (Phase 5)**: Depends on Phase 2 and the alert domain model. T019-T020 can run in parallel; T021-T024 are sequential around admin alerts, centre detail, and audit recording.
- **Polish (Phase 6)**: T025-T026 can run in parallel after the story work is complete; T027-T028 depend on the full admin suite and evidence record.

### User Story Dependencies

- **US1 (P1)**: Depends on the admin route shell and summary model; it can be demonstrated independently once the dashboard loads safely.
- **US2 (P1)**: Depends on the shared role model and billing data flow; it is independently testable with platform-owner billing fixtures.
- **US3 (P2)**: Depends on the route shell, alert flow, and tenant guard logic; it is independently testable for owner/support access and restriction checks.

### Parallel Opportunities

- Setup: T001-T003.
- Foundation: T007-T008 after T004-T006.
- US1: T009-T010.
- US2: T014-T015.
- US3: T019-T020.
- Polish: T025-T026.

## Implementation Strategy

### MVP First

1. Complete the shared admin route shell, role checks, and summary model.
2. Implement the US1 dashboard first as the first demonstrable SaaS-owner workflow.
3. Implement US2 billing and revenue views to show financial risk and follow-up actions.
4. Implement US3 alerts and centre details with audit and tenant guards before polishing the experience.

### Incremental Delivery

1. Platform dashboard for business-safe summary and health signals.
2. Billing and subscription overview for commercial risk monitoring.
3. Alerts and centre drill-downs for operational triage and recovery.
4. Read-only support boundaries and audit evidence for secure multi-tenant operations.
5. Final validation, quickstart evidence, and constitution review.

## Format Validation

All tasks use the required `- [ ] T###` checklist format. Story tasks include exactly one `[US#]` label, parallelizable tasks include `[P]` only when their files and dependencies allow parallel work, and every task description names at least one concrete repository path.
