# Feature Specification: Web Pages and Design System Application

**Feature Branch**: `002-web-pages-design`

**Created**: 2026-09-25

**Status**: Draft

**Input**: User description: "Specify the web pages and their design for the application, make sure you include the links on the home page and design for those as well. Follow the design as set out in the design document."

## Summary

Teacher Helper needs a complete, coherent set of web pages so each role can move from the public home page into the right workflow without dead ends. This feature defines the page surfaces, the links that connect them, and the shared visual behavior that keeps the experience recognizably Teacher Helper across desktop and phone screens.

The experience must follow the project design guide in [Web Design pricipals.md](../001-teacher-helper-mvp/Web%20Design%20pricipals.md). The guide's content-first structure, crisp rules, restrained accents, human line-art, accessible icon treatment, responsive layout, focus states, and reduced-motion behavior are product requirements for every page in this feature.

## Clarifications

### Session 2026-09-25

- Q: Should the home-page "How it works" and "Trust and privacy" links open sections on the home page or dedicated standalone pages? -> A: Both remain clearly separated sections on the home page.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Discover and Enter the Product (Priority: P1)

A prospective centre owner arrives at the public home page, understands what Teacher Helper does, sees how it supports students, guardians, tutors, billing, and privacy, and chooses either to create a centre or log in. They can also follow links to the workflow explanation and trust/privacy content without encountering an unfinished page.

**Why this priority**: The home page is the first product experience and the entry point for every authenticated workflow. Clear navigation prevents the product from feeling like a collection of disconnected screens.

**Independent Test**: Open the public home page on a desktop and a phone-sized viewport, follow every visible navigation and primary action, and confirm each link reaches a purposeful page or section with matching visual treatment.

**Acceptance Scenarios**:

1. **Given** a visitor has no active session, **When** they open the home page, **Then** they can identify the product purpose, intended centre audience, primary value, and the actions to log in or create a centre within the first viewport.
2. **Given** a visitor selects "How it works" or "Trust and privacy", **When** they activate the link, **Then** the home page moves to the relevant clearly separated section without losing the primary sign-up and log-in paths.
3. **Given** a visitor selects "Create your centre" or "Start free", **When** they activate the action, **Then** they arrive at the centre creation entry page with the product context preserved.
4. **Given** an existing centre user selects "Log in", **When** they activate the action, **Then** they arrive at the authentication entry page and can return to the public home page.

### User Story 2 - Move Through Centre Staff Workflows (Priority: P1)

A centre owner, administrator, or tutor signs in and sees navigation appropriate to their role. They can reach onboarding, centre settings, team invitations, people records, sessions, billing, dashboard oversight, exports, and operational alerts without relying on hidden or unlabelled links.

**Why this priority**: The page map must support the core MVP workflows and make role scope visible. A centre cannot operate reliably if its staff cannot find the next action or understand which area they are in.

**Independent Test**: Start from the authenticated entry page as each centre role, visit every allowed primary navigation item, and verify that each page has a clear heading, active location, next action, and route back to the relevant parent area.

**Acceptance Scenarios**:

1. **Given** an owner or administrator has an active centre, **When** they open the centre workspace, **Then** they can reach the dashboard, people, sessions, billing, team, settings, exports, and operations areas from labelled navigation.
2. **Given** a tutor is signed in, **When** they open the workspace, **Then** they see tutor-relevant student and session pages and do not receive navigation that implies access to owner-only billing, exports, or operations controls.
3. **Given** a staff user opens a nested page such as a student, session resource, invitation, invoice, or alert, **When** they inspect the page, **Then** the page identifies its parent area and provides a clear return path.
4. **Given** a staff user lacks permission for a page, **When** they attempt to open it, **Then** they receive a generic, actionable unavailable state that preserves the shared design and does not reveal protected records.

### User Story 3 - Complete Guardian and Passwordless Journeys (Priority: P1)

A guardian verifies a phone number or opens a single-record session, resource, invoice, or receipt link on a phone. The page is focused, readable, and explicit about available, expired, revoked, unavailable, and successful states without asking the guardian to manage a centre account.

**Why this priority**: Guardian pages are the most constrained and sensitive experience. Their visual clarity and state handling directly affect whether families can receive useful updates without exposing child or billing data.

**Independent Test**: Open each guardian page at a narrow phone width and a desktop width, test valid and unavailable states, and verify that the page remains readable, does not scroll horizontally, and exposes only the intended linked record.

**Acceptance Scenarios**:

1. **Given** a guardian has a valid verification challenge, **When** they open it on a phone, **Then** the page clearly explains the action, provides the code entry control, and shows an explicit success or retry state.
2. **Given** a guardian has a valid single-record link, **When** they open it, **Then** the page identifies the permitted update or document and shows only its approved content with a clear route for help or return.
3. **Given** a guardian opens an expired, revoked, invalid, or no-longer-permitted link, **When** the page loads, **Then** it shows a generic unavailable state with recovery guidance and no protected record details.
4. **Given** a guardian uses a small phone screen or rotates the device, **When** they read or act on the page, **Then** text, controls, artwork, and required actions remain visible without horizontal scrolling.

### User Story 4 - Understand Billing and Oversight Areas (Priority: P2)

A centre owner or administrator can discover the billing and oversight pages from the authenticated workspace. They can understand the difference between invoices, payments, receipts, exports, alerts, and dashboard summaries, and can reach a relevant action or recovery state from each page.

**Why this priority**: Billing and operational trust complete the centre's daily workflow. These areas need clear information hierarchy without turning the product into a noisy dashboard.

**Independent Test**: Visit dashboard, invoice, payment, receipt, export, and operations pages with representative empty, populated, and failure states; verify that each page has a clear purpose, supporting content, and role-appropriate actions.

**Acceptance Scenarios**:

1. **Given** an owner opens the centre dashboard, **When** the page loads, **Then** active students, weekly sessions, outstanding invoices, and unresolved events are presented as scannable summaries with links to the underlying areas.
2. **Given** an administrator opens billing, **When** they move between invoices, payments, and receipts, **Then** each page names its purpose and provides a consistent route to related records and actions.
3. **Given** an owner opens exports or operational alerts, **When** an export is processing or an issue needs attention, **Then** the page describes the state, the next safe action, and the relevant centre scope.
4. **Given** a page has no records or cannot complete an operation, **When** the user sees the empty or failure state, **Then** the page offers useful next steps without showing a decorative illustration instead of an explanation.

### User Story 5 - Experience a Consistent, Accessible Product (Priority: P2)

A user moves between public, authenticated, tutor, and guardian pages and experiences one visual language: clear hierarchy, editorial spacing, purposeful accents, useful artwork, obvious focus, and motion that never blocks understanding or action.

**Why this priority**: Consistency lowers the learning cost across roles and makes the safeguarding, billing, and recovery states trustworthy. Accessibility and responsive behavior are release requirements, not finishing touches.

**Independent Test**: Review representative pages from every page family at desktop and mobile sizes with keyboard navigation and reduced motion enabled, then compare page structure, focus treatment, typography, controls, states, and responsive behavior against the design guide.

**Acceptance Scenarios**:

1. **Given** a user navigates with a keyboard, **When** they move through links, controls, forms, and dialogs, **Then** focus is visible, ordered, and never hidden behind a fixed or decorative element.
2. **Given** a user enables reduced motion, **When** they open any page, **Then** non-essential animation stops or becomes a calm static state without removing meaning.
3. **Given** a user opens any page on desktop or mobile, **When** content length, labels, or state messages change, **Then** text remains within its container and controls do not overlap or shift unpredictably.
4. **Given** an icon, character, badge, or color accent appears, **When** the user interprets its meaning, **Then** the page also provides text or accessible naming where needed and does not rely on color or artwork alone.

### Edge Cases

- A visitor follows a home-page link to a page that is not yet available; the product must provide a purposeful, branded unavailable state rather than a blank screen or dead link.
- A role's navigation contains no records yet; the page must explain what is missing and present the next permitted action without exposing another role's controls.
- A long student name, invoice label, translated phrase, or error message exceeds the expected length; the layout must wrap or reflow without horizontal scrolling or obscuring nearby content.
- A guardian opens a link on a very narrow screen, with large text enabled, or with slow loading; required content and actions must remain usable and protected content must not appear before access checks complete.
- A page includes a character or icon asset that fails to load; the text, status, and action must still communicate the full workflow.
- A user refreshes or returns to a nested page after a permission or session change; the page must show the current authorized state rather than stale navigation or protected content.
- A page contains an error, failure, or safeguarding state; human-friendly recovery guidance must not disclose whether another centre or family record exists.

## Requirements *(mandatory)*

### Page Map and Navigation

- **FR-001**: The public home page MUST explain Teacher Helper's mission, intended tutoring-centre audience, primary value, privacy posture, and next actions before sign-in.
- **FR-002**: The public home page MUST provide visible links to log in, create a centre, and the in-page "How it works" and "Trust and privacy" sections. Every visible link MUST resolve to its purposeful destination without requiring a separate public page.
- **FR-003**: The product MUST provide purposeful page surfaces for public entry, authentication, centre onboarding, centre dashboard, centre settings, team invitations, people records, tutor students, sessions, session resources, guardian verification, guardian single-record links, billing invoices, payments, receipts, exports, and operational alerts.
- **FR-004**: Authenticated navigation MUST show the current area, provide a predictable route to the workspace home, and expose only links appropriate to the active role and centre scope.
- **FR-005**: Each nested page MUST provide a clear page title, a visible relationship to its parent area, and a route to the next permitted action or recovery step.
- **FR-006**: The product MUST provide branded, generic unavailable, not-found, expired, revoked, permission-denied, empty, loading, and failure states for page surfaces where those states can occur.
- **FR-007**: The home page and authenticated navigation MUST NOT contain dead links, placeholder labels, routes that expose protected records, or actions that imply access the current role does not have.

### Design System Application

- **FR-008**: Every page and shared component in this feature MUST follow [Web Design pricipals.md](../001-teacher-helper-mvp/Web%20Design%20pricipals.md), including its visual hierarchy, typography, color restraint, spacing, borders, surfaces, interaction states, motion, focus treatment, and information density.
- **FR-009**: Public and authenticated pages MUST use a clear editorial hierarchy with concise headings, readable supporting copy, aligned layout structure, and visible section boundaries; decorative treatment MUST NOT compete with the primary task.
- **FR-010**: The page family MUST use the existing Teacher Helper line-art characters and icon sprite where a visual helps explain a role, workflow, status, or next action; visual assets MUST remain secondary to text and must preserve accessible names and metadata.
- **FR-011**: Primary actions MUST be visually distinct from secondary actions, sign-in MUST remain available without competing with the primary public-page action, and icon-only controls MUST have accessible names and tooltips when their meaning is not obvious.
- **FR-012**: Page surfaces MUST use restrained accents to signal meaning, crisp structural borders, small stable control dimensions, and minimal shadows; no page may rely on a generic centered card or decorative gradient as its primary composition.
- **FR-013**: The page family MUST define responsive behavior for desktop, tablet, and phone widths, including stacked layouts where necessary, readable line lengths, reachable actions, and no horizontal scrolling for required content.
- **FR-014**: Keyboard focus MUST be visible and ordered, contrast and status communication MUST not rely on color alone, and reduced-motion behavior MUST preserve comprehension and task completion.

### Role and Safeguarding Behavior

- **FR-015**: Centre pages MUST communicate the active centre context and MUST not expose another centre's names, counts, records, navigation, or file references in page content or error states.
- **FR-016**: Tutor pages MUST make assignment scope clear and MUST not present owner-only billing, export, or operational controls as available actions.
- **FR-017**: Guardian pages MUST be phone-first, passwordless for MVP, single-record scoped, and explicit about verification, approval, expiry, revocation, unavailable, and recovery states.
- **FR-018**: Guardian page content MUST remain hidden until the current relationship, consent, record visibility, token, and expiry checks permit it; unavailable states MUST be generic and must not reveal the underlying record.
- **FR-019**: Billing and oversight pages MUST identify the centre scope, role-appropriate actions, current status, and safe recovery path for issued invoices, payments, receipts, exports, alerts, and failed operations.

### Content and Link Integrity

- **FR-020**: Page copy MUST use the product terms defined by the MVP specification consistently for centre, tutor, guardian, student, session, invoice, payment, receipt, export, notification, and access link.
- **FR-021**: Every page link MUST have a descriptive accessible name, a valid destination, and a visible or programmatic indication of its current context when it represents navigation.
- **FR-022**: The product MUST preserve useful page content and recovery actions when artwork, icon assets, optional data, or provider status is unavailable.
- **FR-023**: Page changes MUST preserve the existing tenant, privacy, audit, authentication, storage, and provider boundaries defined by the MVP specification and constitution.

## Key Entities

- **Page Surface**: A user-facing destination or in-page section with a purpose, audience, parent area, permitted actions, and supported states.
- **Navigation Link**: A labelled connection between page surfaces, including its audience, destination, current-state behavior, and access expectation.
- **Design Pattern**: A reusable visual and interaction rule for hierarchy, layout, control state, typography, iconography, artwork, motion, focus, and responsive behavior.
- **Page State**: A user-visible condition such as loading, empty, populated, unavailable, expired, revoked, denied, failed, or complete, with its message and recovery action.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a moderated walkthrough, at least 90% of first-time centre owners identify what Teacher Helper does and the correct create-account action within 30 seconds of opening the home page.
- **SC-002**: 100% of visible home-page navigation links and primary calls to action reach an intentional page or in-page section, with no dead links in the release review.
- **SC-003**: A centre staff user can reach each role-permitted primary workspace area from authenticated navigation within three interactions per destination.
- **SC-004**: At least 95% of representative public, authenticated, tutor, and guardian page checks show no horizontal scrolling or clipped required content at phone, tablet, and desktop widths.
- **SC-005**: At least 95% of representative page checks expose a visible keyboard focus state for every interactive control and remain understandable with reduced motion enabled.
- **SC-006**: 100% of representative guardian unavailable, expired, revoked, denied, and failed states hide protected record details and provide a clear recovery or support action.
- **SC-007**: At least 90% of pilot reviewers rate the page family as coherent, clear, and trustworthy, with no critical complaint about finding the next action.
- **SC-008**: Every page family has at least one documented empty state and one documented failure or unavailable state before release approval.

## Assumptions

- The existing MVP specification, domain terminology, authentication boundaries, role model, and data protections remain the source of truth for page behavior.
- The existing page routes and line-art assets are available for reuse; this feature defines their user-facing purpose and presentation rather than replacing the domain workflows behind them.
- The public home page is the primary visitor entry point, while authenticated workspace pages are reached after centre staff sign in.
- The public "How it works" and "Trust and privacy" content remains on the home page as clearly separated sections for the initial release.
- Guardian access remains passwordless for MVP and does not require a general parent dashboard or account creation.
- English is the initial product language; copy must still accommodate longer labels and future localization without fixed-width assumptions.
- Responsive behavior must support common desktop and phone screens, including narrow screens around 360 CSS pixels wide.
- The design guide may evolve, but any intentional deviation for a page must be documented and reviewed before release.
- Page analytics, automated browser checks, and accessibility review are available during implementation and release validation.

## Out of Scope

- Adding new centre, guardian, billing, messaging, or export business rules that are not already defined by the MVP specification.
- Native mobile applications.
- A full visual rebrand or replacement of the existing Teacher Helper artwork library.
- Changing authentication, tenant isolation, consent, retention, or provider contracts solely to support navigation.
- Localized content beyond preparing layouts and copy for future longer labels.
