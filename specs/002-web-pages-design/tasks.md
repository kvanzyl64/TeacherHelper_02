---

description: "Executable implementation tasks for the Teacher Helper web page map and design system application"
---

# Tasks: Web Pages and Design System Application

**Input**: Design documents from `/specs/002-web-pages-design/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/page-map.md, quickstart.md

**Tests**: Included because the specification requires automated page-link, responsive, accessibility, role-navigation, and guardian-state validation.

**Organization**: Tasks are grouped by user story so each page-family slice can be implemented and demonstrated independently.

## Phase 1: Setup (Shared Page Infrastructure)

**Purpose**: Establish the shared page-map vocabulary, visual tokens, asset helpers, and state primitives used by every page family.

- [ ] T001 [P] Define typed page-surface, navigation-link, page-state, and role-visibility fixtures in `apps/web/tests/page-map-fixtures.ts` from `specs/002-web-pages-design/data-model.md`.
- [ ] T002 [P] Add document-level design tokens, focus-ring rules, reduced-motion behavior, and responsive reset styles in `apps/web/app/globals.css` according to `specs/001-teacher-helper-mvp/Web Design pricipals.md`.
- [ ] T003 [P] Create the shared SVG sprite icon wrapper with accessible-name support in `apps/web/components/navigation/icon.tsx` and document decorative versus meaningful icon usage in `apps/web/components/navigation/README.md`.
- [ ] T004 [P] Create reusable page heading, breadcrumb, and loading/empty/unavailable/error state primitives in `apps/web/components/navigation/page-header.tsx` and `apps/web/components/navigation/page-state.tsx`.

## Phase 2: Foundational (Blocking Navigation and Contract Boundaries)

**Purpose**: Make role-aware navigation and page-state behavior available before story-specific page work begins.

- [ ] T005 Define shared authenticated navigation context and active-location behavior in `apps/web/components/navigation/centre-navigation.tsx` and `apps/web/app/(centre)/layout.tsx`; navigation visibility MUST never replace server-side authorization.
- [ ] T006 Add a shared staff page shell with mobile stacking, parent-route links, current-area indication, and responsive content constraints in `apps/web/components/navigation/workspace-shell.tsx`, `apps/web/app/(centre)/layout.tsx`, and `apps/web/app/(tutor)/layout.tsx`.
- [ ] T007 [P] Add UI contract tests for public destinations, role-visible navigation, nested-page parent links, and required page states in `tests/contract/page-map.contract.test.ts` using `specs/002-web-pages-design/contracts/page-map.md`.
- [ ] T008 [P] Add browser test helpers for desktop/mobile viewport selection, horizontal-overflow detection, keyboard focus capture, and reduced-motion emulation in `tests/e2e/page-map-helpers.ts`.

## Phase 3: User Story 1 - Discover and Enter the Product (Priority: P1)

**Goal**: Visitors understand Teacher Helper and can reach every public destination without dead links.

**Independent Test**: Run the public page-map browser journey at desktop and mobile sizes; verify the mission, primary actions, `workflow` section, `trust` section, login link, and centre-creation link.

### Tests for User Story 1

- [ ] T009 [P] [US1] Add public home-page link and anchor tests in `tests/e2e/public-home.spec.ts` covering `Log in`, `Start free`, `How it works` -> `#workflow`, and `Trust and privacy` -> `#trust`.
- [ ] T010 [P] [US1] Add public-page contract assertions in `tests/contract/public-page.contract.test.ts` covering descriptive link names, intentional destinations, and absence of protected record content.

### Implementation for User Story 1

- [ ] T011 [US1] Refine the public home page content hierarchy, anchor sections, primary/secondary actions, and accessible region labels in `apps/web/app/page.tsx` and `apps/web/app/page.module.css` according to `specs/002-web-pages-design/contracts/page-map.md`.
- [ ] T012 [US1] Add consistent return-home and entry-state treatment to `apps/web/app/(auth)/login/page.tsx`, `apps/web/app/auth/recover/page.tsx`, and `apps/web/app/(centre)/onboarding/page.tsx`, preserving existing authentication and onboarding behavior.
- [ ] T013 [US1] Add branded public not-found and unavailable page states in `apps/web/app/not-found.tsx` and `apps/web/components/navigation/page-state.tsx` without revealing protected record existence.

## Phase 4: User Story 2 - Move Through Centre Staff Workflows (Priority: P1)

**Goal**: Owners, administrators, and tutors can find role-permitted workspace surfaces with clear parent routes, current location, and next actions.

**Independent Test**: Use representative owner/admin/tutor fixtures to traverse centre, tutor, and nested pages; verify role filtering, active navigation, page headings, parent links, and unavailable states.

### Tests for User Story 2

- [ ] T014 [P] [US2] Add role-aware navigation contract coverage in `tests/contract/staff-navigation.contract.test.ts` for owner, admin, and tutor visibility, including the rule that tutor navigation does not imply owner-only billing, export, or operations access.
- [ ] T015 [US2] Add owner/admin/tutor browser navigation journeys in `tests/e2e/staff-navigation.spec.ts` covering dashboard, people, team, settings, students, sessions, nested resources, and generic denied states.

### Implementation for User Story 2

- [ ] T016 [US2] Extend centre navigation with dashboard, people, sessions, billing, team, settings, exports, and operations destinations and active-location styling in `apps/web/components/navigation/centre-navigation.tsx` and `apps/web/styles/navigation.css`.
- [ ] T017 [P] [US2] Apply the shared page shell, heading, breadcrumb, state, and responsive layout patterns to centre surfaces in `apps/web/app/(centre)/dashboard/page.tsx`, `apps/web/app/(centre)/people/`, `apps/web/app/(centre)/team/`, and `apps/web/app/(centre)/settings/`.
- [ ] T018 [P] [US2] Apply assignment-scoped navigation, page headings, parent links, and empty/denied states to tutor surfaces in `apps/web/app/(tutor)/students/page.tsx`, `apps/web/app/(tutor)/sessions/`, and `apps/web/app/(tutor)/layout.tsx`.
- [ ] T019 [US2] Add role-safe unavailable and permission-denied states to `apps/web/lib/auth/route-guards.ts`, `apps/web/app/(centre)/error.tsx`, and `apps/web/app/(tutor)/error.tsx`, preserving generic responses and audit behavior.

## Phase 5: User Story 3 - Complete Guardian and Passwordless Journeys (Priority: P1)

**Goal**: Guardians can complete verification and open valid single-record links on phones while expired, revoked, denied, and failed states stay generic and actionable.

**Independent Test**: Run verification and session/invoice link journeys at narrow phone and desktop sizes, including valid and unavailable states; confirm permitted content only and no horizontal scrolling.

### Tests for User Story 3

- [ ] T020 [P] [US3] Add guardian page-map contract cases in `tests/contract/guardian-page.contract.test.ts` for verification, session/resource links, invoice/receipt links, generic unavailable responses, and no general centre navigation.
- [ ] T021 [P] [US3] Extend mobile guardian browser coverage in `tests/e2e/people-and-verification.spec.ts`, `tests/e2e/session-guardian-link.spec.ts`, and `tests/e2e/invoice-guardian-link.spec.ts` for phone layout, rotation, focus, expiry, revocation, and protected-content absence.

### Implementation for User Story 3

- [ ] T022 [US3] Apply the shared page header, state, focus, and responsive patterns to guardian verification in `apps/web/app/(guardian)/verify/[challenge]/page.tsx`, `apps/web/components/guardian/verification-form.tsx`, and `apps/web/styles/guardian.css`.
- [ ] T023 [US3] Apply the single-record guardian page contract to session/resource and invoice/receipt link surfaces in `apps/web/app/(guardian)/link/[token]/page.tsx`, `apps/web/features/guardian-link/`, and `apps/web/components/guardian/session-view.tsx`.
- [ ] T024 [US3] Verify generic expiry, revocation, denial, and failure rendering through `apps/web/lib/errors/responses.ts`, `apps/web/app/(guardian)/link/[token]/page.tsx`, and `apps/web/app/(guardian)/verify/[challenge]/page.tsx` without changing access-link or consent policy decisions.

## Phase 6: User Story 4 - Understand Billing and Oversight Areas (Priority: P2)

**Goal**: Owners and administrators can find billing and oversight pages and understand status, next action, and safe recovery paths.

**Independent Test**: Visit dashboard, invoices, payments, receipts, exports, and operations alerts with representative empty, populated, processing, failed, and ready states; verify centre scope and role actions.

### Tests for User Story 4

- [ ] T025 [P] [US4] Add billing and oversight page contract cases in `tests/contract/billing-oversight-page.contract.test.ts` for headings, related-record links, status text, centre scope, and recovery actions.
- [ ] T026 [P] [US4] Extend billing and oversight browser journeys in `tests/e2e/invoice-guardian-link.spec.ts` and `tests/e2e/oversight.spec.ts` for empty, populated, processing, failed, ready, expired, and deleted states.

### Implementation for User Story 4

- [ ] T027 [US4] Add or refine invoice, payment, and receipt page surfaces with shared headings, related-record navigation, status summaries, and safe recovery actions in `apps/web/app/(centre)/billing/` and `apps/web/components/people/`.
- [ ] T028 [US4] Apply the shared page shell and state patterns to dashboard summaries and unresolved events in `apps/web/app/(centre)/dashboard/page.tsx` and `apps/web/app/(centre)/operations/alerts/page.tsx`.
- [ ] T029 [US4] Apply centre-scoped export request, processing, ready, failed, expired, and deleted states to `apps/web/app/(centre)/exports/page.tsx`, `apps/web/components/navigation/page-state.tsx`, and `packages/domain/src/oversight/export-service.ts` without weakening export authorization.

## Phase 7: User Story 5 - Experience a Consistent, Accessible Product (Priority: P2)

**Goal**: All page families share the design guide's hierarchy, focus treatment, responsive behavior, artwork rules, and reduced-motion behavior.

**Independent Test**: Review representative public, centre, tutor, guardian, billing, and oversight pages at desktop/mobile sizes with keyboard navigation and reduced motion enabled; compare results with the design guide and page-map contract.

### Tests for User Story 5

- [ ] T030 [P] [US5] Add cross-page responsive and overflow checks in `tests/e2e/design-system.spec.ts` for desktop, tablet, and approximately 360-390 CSS pixel viewports.
- [ ] T031 [P] [US5] Add keyboard-focus, accessible-name, and reduced-motion checks in `tests/e2e/design-system-accessibility.spec.ts` for navigation, forms, page actions, icons, characters, and state panels.

### Implementation for User Story 5

- [ ] T032 [P] [US5] Align shared navigation, page headers, state panels, buttons, links, and focus styles with the design guide in `apps/web/styles/navigation.css`, `apps/web/styles/guardian.css`, and `apps/web/app/globals.css`.
- [ ] T033 [P] [US5] Integrate the shared icon sprite and role-oriented character artwork into applicable navigation, onboarding, empty, success, and guidance states in `apps/web/components/`, `apps/web/app/`, and `apps/web/public/images/line-art/`, preserving accessible SVG metadata and reduced-motion behavior.
- [ ] T034 [US5] Review page copy and terminology against `specs/002-web-pages-design/spec.md`, `specs/002-web-pages-design/contracts/page-map.md`, and `specs/001-teacher-helper-mvp/Web Design pricipals.md`; remove placeholder labels and document any intentional deviations in `specs/002-web-pages-design/quickstart.md`.

## Phase 8: Polish and Cross-Cutting Validation

**Purpose**: Prove the page map and design system work together without changing domain behavior.

- [ ] T035 [P] Run the existing Vitest suite and add regression assertions for unchanged tenant, auth, guardian-link, billing, notification, storage, and audit behavior in `tests/contract/`, `tests/integration/`, and `packages/domain/src/`.
- [ ] T036 [P] Run lint, typecheck, and production build and record outcomes in `specs/002-web-pages-design/quickstart.md`.
- [ ] T037 Run the complete page-map quickstart at desktop and mobile sizes and record link destinations, role navigation, state coverage, overflow, focus, reduced-motion, and guardian disclosure evidence in `specs/002-web-pages-design/quickstart.md`.
- [ ] T038 [P] Review all changed page surfaces against constitution obligations and record accessibility, tenant/child-data, recovery, and protected-content evidence in `specs/002-web-pages-design/quickstart.md`.

## Dependencies and Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001-T004 can run in parallel because they create separate fixtures, styles, asset helpers, and state primitives.
- **Foundational (Phase 2)**: Depends on Setup. T005-T006 share navigation/layout files and run sequentially; T007-T008 can run in parallel after the shared contract shape is agreed.
- **US1 (Phase 3)**: Depends on foundational navigation/state primitives. T009-T010 can run in parallel; T011-T013 are sequential where they share the public page and state primitives.
- **US2 (Phase 4)**: Depends on T005-T006 and can proceed after US1 public entry is usable. T014-T015 can run in parallel; T016 must precede T017-T019 where navigation and shell files overlap.
- **US3 (Phase 5)**: Depends on foundational state primitives and existing guardian verification/link boundaries. T020-T021 can run in parallel; T022-T024 are sequential within guardian surfaces.
- **US4 (Phase 6)**: Depends on shared state/navigation work and existing billing/oversight services. T025-T026 can run in parallel; T027-T029 are ordered where dashboard/state components overlap.
- **US5 (Phase 7)**: Depends on representative page surfaces from US1-US4. T030-T031 can run in parallel; T032-T034 are ordered around shared styles/assets and final copy review.
- **Polish (Phase 8)**: T035-T036 can run in parallel after implementation; T037-T038 depend on all story work and complete the evidence record.

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2; public home and entry flow can be demonstrated independently.
- **US2 (P1)**: Depends on Phase 2 and uses the authenticated centre/tutor shell; it does not require guardian or billing page completion.
- **US3 (P1)**: Depends on Phase 2 and existing guardian verification/access-link policy; it is independently testable with existing fixtures.
- **US4 (P2)**: Depends on shared page state/navigation and existing billing/oversight records; it does not change billing rules.
- **US5 (P2)**: Consumes representative surfaces from US1-US4 and is the final cross-page consistency pass.

### Parallel Opportunities

- Setup: T001-T004.
- Foundation: T007-T008 after T005-T006.
- US1: T009-T010.
- US2: T014-T015 and T017-T018 after T016.
- US3: T020-T021.
- US4: T025-T026.
- US5: T030-T031 and T032-T033 where files do not overlap.
- Polish: T035-T036 and T038.

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2 shared page primitives and navigation boundaries.
2. Complete US1 public home links and in-page sections as the first demonstrable slice.
3. Complete US2 staff navigation and page states so centre roles can traverse the workspace.
4. Complete US3 guardian pages and protected-state evidence before expanding polish.

### Incremental Delivery

1. Public entry -> clear product understanding and intentional links.
2. Staff workspace -> role-aware page map and recoverable states.
3. Guardian journeys -> phone-first, single-record, generic unavailable states.
4. Billing/oversight -> operational page hierarchy and recovery actions.
5. Cross-page polish -> accessibility, responsive, artwork, focus, and reduced-motion validation.
6. Final evidence -> full regression, build, browser, and constitution review.

## Format Validation

All tasks use the required `- [ ] T###` checklist format. Story tasks include exactly one `[US#]` label, parallelizable tasks include `[P]` only when their files and dependencies allow parallel work, and every task description names at least one concrete file or directory path.
