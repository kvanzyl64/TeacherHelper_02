# Feature Specification: Teacher Helper MVP Platform

**Feature Branch**: `001-teacher-helper-mvp`

**Created**: 2026-09-25

**Status**: Draft

**Input**: User description: "Create the specification for this project, based on TeacherHelperSpec.md"

## Mission & Product Positioning

Teacher Helper is a SaaS operations platform for small tutoring centres that need a calmer way to
manage students, guardian communication, invoicing, and admin tasks without juggling WhatsApp,
spreadsheets, and disconnected systems.

The product mission is to help centre owners and tutors keep families informed, reduce manual
follow-up, and provide a secure, mobile-first communication layer for approved session updates and
term invoices. The public SaaS experience must make the value clear immediately: a centre can sign
up, create a workspace, invite staff, and begin communicating with guardians within the same system.

A typical landing-page value proposition is:

- Keep parent communication in one secure, role-aware place.
- Send approved session and invoice updates to verified guardians without new parent logins.
- Give centre owners a clear operational dashboard for students, billing, and unresolved issues.
- Keep sensitive student information isolated per centre and protected by role-based access.

## Clarifications

### Session 2026-09-25

- Q: Should each WhatsApp link open only the specific approved session or invoice it was sent for,
  or should it open a broader passwordless parent view of all permitted records? -> A: Each link
  opens only the specific approved session, resource, invoice, or receipt.
- Q: How long should a WhatsApp access link remain valid after it is sent? -> A: 7 days.
- Q: How should a guardian’s WhatsApp number be verified before the first protected message is
  sent? -> A: Centre staff confirm the relationship and the guardian completes a one-time code
  confirmation.
- Q: If WhatsApp delivery fails, should the MVP use another delivery channel automatically? -> A:
  Retry WhatsApp and alert the centre; no automatic fallback channel in MVP.
- Q: Should the MVP use separate retention rules for student/session data, billing records, and
  audit events? -> A: Separate retention rules by record type with centrally defined defaults.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Centre Onboarding and Access (Priority: P1)

A centre owner signs up for a trial or subscription, creates an isolated centre workspace,
completes essential centre details, and invites an administrator and tutor. The centre records a
guardian’s verified WhatsApp number and linked student relationship; the guardian does not create
or use a portal login for MVP access. Each user can access only the features and student
information permitted by their role and centre.

**Why this priority**: A centre cannot use any other MVP workflow until its workspace and users
exist. Tenant isolation is also the foundation for protecting every later record.

**Independent Test**: Create two centre workspaces, invite users to both, and verify that each
user can complete the setup for their own centre without viewing or changing the other centre’s
records.

**Acceptance Scenarios**:

1. **Given** a new centre owner with no workspace, **When** they select a trial or subscription
   and submit valid centre details, **Then** the system creates one isolated centre workspace and
   shows the setup steps.
2. **Given** an existing centre name, **When** another owner attempts to create the same centre
   name, **Then** the system explains the conflict and does not create a duplicate workspace.
3. **Given** a guardian’s verified contact and student relationship, **When** the centre enables
  parent updates, **Then** the guardian is eligible to receive only the linked student’s permitted
  information through a secure, passwordless link.
4. **Given** a user from Centre A, **When** they request a student, invoice, file, or session
   belonging to Centre B, **Then** the request is denied and the access attempt is recorded.

---

### User Story 2 - Student, Guardian, and Tutor Records (Priority: P1)

A centre administrator creates student and guardian records, assigns a tutor, records consent,
verifies the guardian’s WhatsApp number, and can update enrolment status. Tutors see only the
students assigned to them, while guardians see only linked student information allowed by the
centre through passwordless, phone-friendly links.

**Why this priority**: Accurate relationships and permissions are required before sessions,
notifications, invoices, or parent visibility can be trusted.

**Independent Test**: Create a student with two guardians and one tutor, verify the relationships
and consent, then test the administrator, tutor, and parent views independently.

**Acceptance Scenarios**:

1. **Given** an authorised centre administrator, **When** they add a student, guardian, tutor
  assignment, enrolment status, consent record, and guardian relationship confirmation, **Then**
  the system saves the relationships and displays their current status.
2. **Given** a tutor assigned to Student A but not Student B, **When** the tutor opens the student
   list, **Then** only Student A is available.
3. **Given** a guardian linked to Student A with a verified WhatsApp number, **When** the guardian
  opens a valid message link on a phone, **Then** a responsive page shows only permitted
  information for Student A without asking for a username or password.
4. **Given** a required consent record is missing or withdrawn, **When** a user attempts an action
   that requires that consent, **Then** the system blocks the action or routes it for authorised
   review with a clear explanation.
5. **Given** centre staff have confirmed a guardian relationship, **When** the guardian completes
  the one-time WhatsApp code confirmation, **Then** the number becomes eligible for protected
  messages without creating a parent account.

---

### User Story 3 - Session Logging and Parent Update (Priority: P1)

A tutor records a session with its date, duration, subject, topics, attendance, notes, homework,
and next focus. After the centre’s configured review or approval step, the guardian receives an
automated WhatsApp message containing a secure link to the approved session update. The linked
page is designed for a phone screen and does not require a login.

**Why this priority**: Session communication is the core value of the MVP and replaces fragmented
manual updates for centres and families.

**Independent Test**: Record a session for a linked student, approve it, and verify that the
guardian receives an automated WhatsApp link, can open only that session’s permitted details and
resources on a phone without logging in, and cannot view an unapproved or unrelated record.

**Acceptance Scenarios**:

1. **Given** an assigned tutor and an upcoming or completed session, **When** the tutor submits
   attendance, topics, notes, homework, and next focus, **Then** the session is saved with an
   explicit review status.
2. **Given** a session awaiting review, **When** an authorised centre user approves it, **Then**
  the configured guardian-visible details for that session become available and an automated
  WhatsApp message with a link to that specific session is sent to the verified guardian number.
3. **Given** an unapproved or restricted session, **When** a guardian opens a link, **Then** the
  restricted details are not visible and the link does not reveal the underlying record.
4. **Given** a WhatsApp delivery failure or an expired link, **When** the system cannot deliver or
  open the message, **Then** WhatsApp delivery is retried, the failure is visible to the centre,
  the event is recorded for follow-up, and an authorised centre user can resend a fresh link.
5. **Given** a tutor lacks permission to edit a past session, **When** they attempt to change it,
   **Then** the system denies the change and explains how to request an authorised correction.

---

### User Story 4 - Term Invoicing and Payment Records (Priority: P1)

A centre owner or administrator generates term invoices for students or families, reviews the
amount and South African Rand display, sends the invoice by automated WhatsApp message with a
secure phone-friendly link, and records manual EFT, cash, or other payment information. Guardians
can open only the specific invoice or receipt link sent for their linked family without a login.

**Why this priority**: Payment visibility is an explicit MVP priority and a measurable operational
improvement for pilot centres.

**Independent Test**: Generate an invoice for a student or family, issue it, record a payment,
and verify the resulting invoice status, receipt, parent view, and audit history.

**Acceptance Scenarios**:

1. **Given** a configured term and charge, **When** an authorised centre user generates an invoice,
   **Then** the invoice includes the billed party, period, line items, total in ZAR, due status,
   and a downloadable document.
2. **Given** an issued invoice and a verified guardian number, **When** the centre sends it through
  the enabled WhatsApp channel, **Then** the delivery status is recorded and the guardian can open
  only that invoice from the secure phone-friendly link without logging in.
3. **Given** a manual EFT or cash payment, **When** an authorised user records the payment,
   **Then** the invoice status, payment history, and receipt reflect the recorded amount and date.
4. **Given** a disputed, failed, or partially paid invoice, **When** the centre records the event,
   **Then** the status and follow-up action are visible to authorised centre users and do not expose
   another family’s financial information.

---

### User Story 5 - Operational Oversight and Trust (Priority: P2)

A centre owner reviews active students, weekly sessions, outstanding invoices, recent notification
failures, and security-relevant activity from a centre dashboard. The owner can export permitted
centre data and identify unresolved concerns without accessing another centre’s information.

**Why this priority**: Basic oversight lets pilot centres operate confidently and provides a
reliable response path for access, consent, billing, and delivery problems.

**Independent Test**: Seed a centre with sessions, invoices, notifications, and an access failure,
then verify that the dashboard totals, alerts, and export contain only that centre’s permitted data.

**Acceptance Scenarios**:

1. **Given** a centre with current records, **When** the owner opens the dashboard, **Then** the
   system shows active students, weekly sessions, outstanding invoices, and actionable failures.
2. **Given** a recorded security, billing, or notification event, **When** an authorised owner
   reviews activity, **Then** the event includes its time, actor or source, affected record type,
   and current resolution status.
3. **Given** an authorised export request, **When** the owner confirms the request, **Then** the
   resulting export contains only the centre’s permitted data and its generation is audited.

### Edge Cases

- A centre invitation expires, is revoked, or is accepted by an email already linked to another
  role; the system MUST provide a clear recovery path without granting unintended access.
- A guardian’s one-time verification code expires, is entered incorrectly too many times, or is
  requested for a number that centre staff have not confirmed; the system MUST withhold protected
  messages and provide an authorised recovery path.
- A student has multiple guardians with different visibility permissions; each guardian MUST see
  only the information assigned to their relationship.
- A tutor is unassigned, placed on leave, or removed after recording a session; historical records
  MUST retain their authorship while future access follows the new assignment.
- A session is edited after approval, a notification was already sent, or a parent has viewed it;
  the system MUST preserve the audit trail and clearly indicate the current approved version.
- An invoice is regenerated, partially paid, overpaid, cancelled, or associated with a family
  rather than a single student; totals, receipts, and statuses MUST remain unambiguous.
- A WhatsApp provider is unavailable, a message is delayed, or a secure link expires after 7 days
  or is revoked; the system MUST retry WhatsApp delivery, the centre MUST see the failure, and an
  authorised centre user MUST be able to resend a fresh link without exposing data.
- A guardian opens a valid link on a narrow phone screen, rotates the device, or has a slow
  connection; the page MUST remain readable and usable without horizontal scrolling or hidden
  required actions.
- A guardian forwards a link to another person or opens it after the permitted relationship ends;
  the system MUST enforce expiry, revocation, student scope, and single-record scope before showing
  information.
- A user attempts cross-centre access, bulk export, or a disallowed file download; the action MUST
  be denied, recorded, and must not reveal whether the target record exists.
- A backup, export, or recovery operation fails; the responsible administrator MUST be alerted and
  the last known successful operation MUST remain identifiable.
- Student/session, billing, and audit records reach different retention boundaries; the system MUST
  apply the centrally defined policy for the relevant record type and preserve required legal or
  security evidence without retaining child data longer than necessary.

## Requirements *(mandatory)*

### Web Design Requirements

All web pages, screens, shared components, layout grids, and CSS or Tailwind definitions created
for this feature MUST follow the project design guide in [Web Design pricipals.md](Web%20Design%20pricipals.md).
The guide is part of this specification and governs visual direction, typography, colour and
surface hierarchy, spacing, borders, component states, motion, keyboard focus, information density,
and responsive layout. Where this specification is more specific, the requirement in this
specification takes precedence.

### Functional Requirements

- **FR-000**: The public SaaS landing page MUST explain the product mission, describe the value to
  tutoring centres, and provide clear actions to log in or create an account.
- **FR-000a**: Every web page and shared web component delivered for the MVP MUST apply the
  requirements in [Web Design pricipals.md](Web%20Design%20pricipals.md), including its visual
  system, responsive behaviour, interaction states, motion guidance, and accessibility-related
  focus treatment. Any intentional deviation MUST be documented in the relevant implementation
  plan or design decision.
- **FR-001**: The system MUST create an isolated centre workspace for each approved onboarding
  request and MUST prevent duplicate centre names according to the centre’s configured identity.
- **FR-002**: The system MUST authenticate centre owners, administrators, and tutors and MUST
  support secure invitation, password recovery, session expiry, and account revocation. MVP parent
  access MUST NOT require a parent username, password, or portal account.
- **FR-003**: The system MUST authorize every protected action using both the user’s role and centre
  membership, including records, files, notifications, invoices, exports, and administrative tools.
- **FR-004**: The system MUST record student profiles, guardian relationships, tutor assignments,
  enrolment status, academic information, accommodations, goals, consent status, and whether the
  centre has confirmed each guardian relationship.
- **FR-004a**: The system MUST require centre relationship confirmation and a successful one-time
  WhatsApp code confirmation before sending a guardian protected student, session, resource, invoice,
  or receipt information.
- **FR-005**: The system MUST allow authorised centre users to configure guardian-visible fields and
  MUST apply those settings consistently in phone-friendly linked pages, exports, and notifications.
- **FR-006**: The system MUST allow assigned tutors or authorised administrators to create session
  records containing date, duration, subject, topics, attendance, notes, homework, and next focus.
- **FR-007**: The system MUST give every session an explicit review status and MUST prevent parent
  delivery of restricted content until the configured approval condition is satisfied.
- **FR-008**: The system MUST provide passwordless, secure, phone-friendly linked pages for verified
  guardians to view only the permitted details and resources for the specific approved session,
  issued invoice, receipt, or other explicitly linked record.
- **FR-009**: The system MUST send automated WhatsApp messages containing secure, expiring, revocable,
  student-scoped, single-record links for approved session updates and issued invoices, and MUST
  expire each link 7 days after sending, retry failed WhatsApp delivery, alert the centre when
  delivery remains unsuccessful, and retain delivery, open, expiry, revocation, and failure details.
- **FR-010**: The system MUST generate term invoices for a student or family using configured charges
  and MUST display totals in South African Rand with clear tax treatment.
- **FR-011**: The system MUST allow authorised centre users to record manual EFT, cash, and other
  payments, issue receipts, and track unpaid, partially paid, paid, disputed, failed, and cancelled
  invoice states.
- **FR-012**: The system MUST provide a centre dashboard showing active students, weekly sessions,
  outstanding invoices, and unresolved notification, access, consent, or billing events.
- **FR-013**: The system MUST provide secure centre data export and MUST record the requester, scope,
  time, result, and retention or deletion action for each export.
- **FR-014**: The system MUST protect student, guardian, session, file, communication, billing,
  consent, and audit data in transit and at rest.
- **FR-015**: The system MUST retain audit records for tenant, identity, permission, student,
  session, notification, billing, export, security, and administrative events.
- **FR-016**: The system MUST provide daily incremental backups, defined retention, tenant data
  integrity checks, and an identified recovery procedure for the MVP. Retention MUST use separate
  centrally defined rules for student/session data, billing records, and audit events.
- **FR-017**: The system MUST provide user-facing error messages and a centre-admin follow-up path
  when a notification, payment record, export, backup, or other critical operation fails.
- **FR-018**: The system MUST render all guardian-facing linked pages for supported mobile browsers,
  including narrow phone screens, without horizontal scrolling and without requiring a native mobile
  application or parent login for MVP access.
- **FR-019**: The system MUST exclude full scheduling and booking calendars, automated online payment
  reconciliation, advanced analytics, full white-label customization, and native mobile apps from
  this MVP feature.

### Key Entities *(include if feature involves data)*

- **Centre**: An isolated tenant with identity, branding, subscription, notification, billing, and
  operational settings.
- **User**: A person with one or more centre-scoped roles, authentication state, and permissions.
- **Student**: A learner with enrolment, academic, accommodation, goal, consent, and visibility data.
- **Guardian**: A parent or responsible adult linked to one or more students with explicit visibility
  and communication permissions.
- **Tutor**: A volunteer or staff educator with qualifications, assignments, availability, and access
  to permitted student records.
- **Session**: A tutoring interaction with attendance, learning content, resources, review state,
  parent visibility, and audit history.
- **Notification**: An automated WhatsApp message or supported delivery concerning a session, invoice,
  announcement, reminder, or failure, including delivery and link status.
- **Access Link**: A secure, expiring, revocable, student-scoped, single-record link that grants a
  verified guardian access to permitted information for 7 days without a username or password.
- **Invoice**: A term charge for a student or family with line items, total, status, due information,
  payment history, receipt, and delivery record.
- **Consent Record**: A dated grant, restriction, or withdrawal governing use and visibility of
  student information or communications.
- **Audit Event**: An immutable record of a security, permission, data, billing, notification,
  export, administrative, or recovery action.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Five pilot centres can complete onboarding, add their initial students and tutors, and
  begin recording sessions within one business day without administrator intervention.
- **SC-002**: A centre owner can generate and review a complete term invoice batch for a pilot centre
  within 30 minutes.
- **SC-003**: At least 95% of approved session updates result in an automated WhatsApp message with
  an openable secure link within five minutes of approval during normal operation.
- **SC-004**: In acceptance testing, 100% of attempted cross-centre record, file, invoice, and
  export accesses are denied and produce an auditable security event.
- **SC-005**: At least 90% of pilot guardians can open an automated WhatsApp link on a phone and
  view the linked approved session, homework, and attendance record on their first attempt without
  centre assistance or login credentials.
- **SC-006**: At least 95% of invoice payment records entered by authorised centre users show the
  correct status, amount, date, and receipt information on first review.
- **SC-007**: Every MVP release passes the agreed automated tests, security-boundary checks, backup
  verification, and staging workflow checks before production approval.
- **SC-008**: Centre owners rate the MVP’s primary onboarding, session communication, and invoicing
  workflows at least 4 out of 5 for clarity in pilot feedback.

## Assumptions

- The first release targets independent, volunteer-driven, and small multi-tutor South African
  afterschool or tutoring centres.
- MVP access is through responsive desktop and mobile web browsers; native applications are not
  required.
- MVP guardians use secure WhatsApp links by default and do not create or maintain parent accounts.
- WhatsApp messages are automated and template-based, depend on an enabled provider, and contain
  no sensitive student information beyond what is necessary to identify the centre and action.
- MVP delivery uses WhatsApp only; failed delivery is retried and escalated to the centre rather
  than automatically switching to SMS or email.
- Linked pages enforce expiry, revocation, and student scope; an authorised centre user can resend
  a fresh link after a delivery failure or the 7-day expiry.
- Portal pages are designed for phone screens and remain usable on supported mobile browsers;
  parent login, native applications, and a full parent dashboard are out of MVP scope.
- Manual EFT and cash payment records are in scope; automated online payment reconciliation is out
  of scope for MVP.
- Pricing and invoice amounts are in ZAR, with the centre configuration defining whether displayed
  amounts include VAT.
- The first release supports one centre tenant per operational workspace; enterprise tenancy,
  multi-branch white-labeling, and cross-tenant benchmarking are later capabilities.
- Standard retention, deletion, export, consent, and incident procedures will be confirmed during
  planning and documented before production use, with separate centrally defined defaults for
  student/session data, billing records, and audit events.
- The constitution’s tenant isolation, privacy, safeguarding, auditability, human review, testing,
  and delivery gates apply to every requirement in this feature.
