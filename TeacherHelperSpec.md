# Teacher Helper Specification

**Status:** Draft  
**Audience:** Product, design, engineering, and centre stakeholders  
**Market:** South African afterschool and tutoring centres  
**Platforms:** Responsive web application for desktop and mobile browsers; native mobile apps are not required for MVP

## 1. Product Scope

Teacher Helper is a multi-tenant SaaS platform for independent, volunteer-driven, and small multi-tutor afterschool centres. It replaces fragmented WhatsApp, spreadsheet, and cash-based administration with:

- Student and tutor management
- Session logging and parent visibility
- Progress, attendance, and feedback tracking
- Invoicing, payments, and subscription management
- Centre reporting and operational oversight
- AI-assisted session planning and summaries
- Secure communication and notifications

Each centre operates as an isolated tenant. The product includes a public SaaS site and four authenticated experiences: Centre, Parent, Volunteer Tutor, and optional Student access. A Super Admin manages the platform across tenants.

## 2. Users and Portals

### Public SaaS Site

- Explain the application and its benefits
- Show plans, feature comparisons, and a pricing calculator
- Support early-bird offers and centre sign-up
- Provide payment and subscription entry points
- Include representative application screens or demos

### Centre Portal

Centre owners and administrators can:

- Configure centre profile, branding, contact, billing, notification, and operational settings
- Manage staff, volunteer tutors, roles, qualifications, availability, leave, assignments, and allocation history
- Manage student enrolment, guardians, academic information, accommodations, assigned tutors, and status
- Review daily and weekly sessions, feedback trends, attendance, and AI-generated summaries
- Manage student billing, invoices, receipts, payment status, staff compensation, and volunteer expense reimbursements
- View attendance, academic progress, volunteer engagement, financial, usage, and adoption reports
- Configure access permissions, session templates, payment methods, and notification preferences

### Parent Portal

Parents and guardians can:

- View linked student profiles, personal details, assigned tutors, and enrolment information
- View session history, notes, homework, resources, attendance, tutor feedback, and progress reports
- View report cards, academic performance, personal goals, and learning progress
- View and download current and past session resources and notes
- Message tutors and centre staff, including supervised communication involving the student
- Receive session, announcement, invoice, payment, and other relevant notifications
- View invoices, receipts, payment history, and make payments
- Submit session and learning-progress feedback
- Access helpdesk support and FAQs

### Volunteer Tutor Portal

Tutors can:

- View assigned students, upcoming sessions, and allocation history
- Manage availability and submit leave or scheduling information
- Plan sessions using AI suggestions based on student progress, recent notes, and assessment history
- Review and edit suggested materials, exercises, and plans before use
- Record sessions, attendance, topics, homework, next focus, engagement, challenges, and progress
- View and edit permitted past session records
- Upload resources and notes
- Flag concerns and escalate issues to centre administrators
- View student or parent feedback
- Track hours served, badges, testimonials, and access training resources

### Student Access (Optional, Recommended)

Where enabled and supervised by a parent or centre, students can:

- View upcoming and past sessions
- Download assigned resources and notes
- View goals, tutor feedback, and report cards
- Message tutors to ask questions or request help
- Submit session feedback and rate their learning experience

### Super Admin Portal

Platform operators can:

- Manage tenants, subscriptions, support, and platform configuration
- Monitor tenant health, system performance, usage, feature adoption, and churn indicators
- Review billing status, payment failures, and support/payment arrangements
- Manage compliance reporting, exports, backups, incidents, and retention actions
- Enforce platform-wide access controls, rate limits, and maintenance processes

## 3. Core Workflows

### Centre Onboarding

1. A centre signs up and selects a trial or subscription plan.
2. The system validates that the centre name is unique and creates an isolated tenant.
3. A setup wizard collects centre details, branding, billing settings, staff, tutors, and initial students.
4. The centre can invite users and begin logging sessions.

### Session to Parent Update

1. A tutor or administrator records the date, duration, subject, topics, homework, attendance, and next focus.
2. The centre may review the record or enable automatic approval for trusted tutors.
3. The system sends an approved notification to the parent by WhatsApp or portal notification.
4. The parent opens the secure portal link and views the session information, resources, progress, and invoice history.

### Billing

1. The centre generates term-based or custom-period invoices per student or family.
2. Invoices can be issued as PDFs and sent through the portal or WhatsApp.
3. The centre records manual EFT, cash, or other payments, or the parent pays online where supported.
4. Payment status, receipts, reminders, failures, and disputes are tracked and escalated to the centre administrator when necessary.

### AI-Assisted Planning

1. The tutor requests a plan using the student’s permitted progress and session history.
2. The system suggests topics, exercises, materials, or a summary.
3. The tutor must review, edit, approve, or reject the suggestions.
4. The system records the suggestion and the tutor’s decision. AI content is never sent or used as final educational content without tutor approval.

## 4. Functional Requirements

### Identity, Access, and Communication

- Secure authentication for centre admins, tutors, parents, students where enabled, and Super Admins
- Role-based permissions scoped to both user role and tenant
- Password reset and secure session management
- Secure parent magic links may be used for low-friction access; optional parent accounts are supported
- Messaging and notifications for permitted users, including session updates, announcements, reminders, billing events, and escalations
- Secure handling of communication involving minors

### Student, Tutor, and Session Management

- Maintain student profiles, guardians, enrolment status, assigned tutors, academic records, accommodations, goals, and consent
- Maintain tutor profiles, qualifications, availability, leave, assignments, hours, recognition, and testimonials
- Record, search, and display sessions in newest-first order with date, duration, subject, topics, homework, attendance, feedback, resources, and next focus
- Support session cancellation notifications and availability-conflict handling through configurable rules or centre-admin intervention
- Allow authorised users to upload, download, and manage session resources and notes
- Route accommodation requests, concerns, and other escalations to centre administrators

### Progress, Analytics, and Recognition

- Track attendance, academic progress, assessments, goals, feedback, and report cards
- Provide centre reports for attendance trends, academic progress, volunteer engagement, finances, and feedback
- Provide parent-facing progress views appropriate to the student
- Provide tutor and centre recognition tracking for hours, badges, testimonials, and contribution history
- Provide platform usage, adoption, resource, and churn reporting to Super Admins

### Billing and Payments

- Generate term, holiday-programme, and custom-period invoices
- Support flat fees or sessions multiplied by a configured rate
- Provide invoices, receipts, payment history, status tracking, reminders, and dispute/failure escalation
- Support manual EFT, cash, and supported payment providers; online payment reconciliation is a later-phase capability
- Display and process all pricing in South African Rand (ZAR), with clear VAT-inclusive or VAT-exclusive treatment
- Support centre staff compensation and volunteer expense reimbursement records where applicable

### Multi-Tenancy and Subscriptions

- Isolate all centre data, users, configuration, files, billing, and reports from other tenants
- Support tenant branding, business rules, payment methods, notification preferences, custom URLs, and feature configuration
- Provide trials, monthly and annual billing, subscription upgrades and downgrades, usage metering, limits, cancellation, retention, and archival
- Notify centres about billing events, failed payments, expiry, and subscription changes
- Prevent downgrades that conflict with current student counts or enabled features

### AI

- Suggest session plans, materials, exercises, summaries, and feedback analysis based on authorised student data
- Make all AI output clearly identifiable as suggestions
- Require tutor review and approval before educational AI output is used or shared
- Allow tutor override, editing, rejection, and reporting of unsuitable content
- Retain an audit record of AI suggestions, approvals, edits, and use

## 5. MVP Scope: Launch, 0–3 Months

The MVP prioritises payment visibility and parent communication:

- Centre onboarding, tenant creation, trial, and basic subscription selection
- Student and guardian register
- Tutor management and limited tutor access
- Session logging with attendance, notes, homework, and next focus
- Mobile-first parent portal using secure magic links
- Session history, homework, attendance, invoices, and configurable parent visibility
- Template-based WhatsApp notifications for sessions and invoices
- Term invoice generation, PDF output, and manual payment logging
- Centre dashboard with active students, weekly sessions, outstanding invoices, and quick actions
- Owner, admin, tutor, and parent authentication and permissions
- Basic audit logging, consent capture, backups, and tenant isolation

### MVP Success Criteria

- Five pilot centres use the product for one complete term
- Parents consistently receive session notes through the portal or WhatsApp
- Centre owners can generate term invoices in under 30 minutes

### Explicitly Out of MVP

- Full scheduling and booking calendar
- Automated online payment reconciliation
- Advanced analytics, curriculum tagging, and structured progress maps
- Full white-label and enterprise customisation
- Native mobile applications

## 6. Roadmap After MVP

### Phase 2: 3–8 Months

- Scheduling calendar, reminders, cancellation handling, and holiday-programme attendance
- Configurable automated payment reminders
- Online Ozow, SnapScan, or equivalent payment integration with webhook reconciliation
- Progress scores and simple parent-facing charts
- Tutor reports for delivered sessions and payroll
- Reviewed AI session planner

### Phase 3: 8–18 Months

- Bulk term invoice generation and dispatch
- Optional paid parent premium features with centre/platform revenue sharing
- Enquiry CRM, referrals, and prospect tracking
- WhatsApp broadcast templates with opt-in and opt-out management
- Curriculum tagging and optional CAPS-aligned progress maps

### Phase 4: 18+ Months

- White-label multi-branch deployments and dedicated enterprise tenancy
- Xero, Sage, LMS, and school-system integrations
- Anonymised cross-tenant benchmarking
- SLA-backed hosting and onboarding for larger NGO or municipal programmes

## 7. Pricing and Commercial Model

### Launch Pricing

- Starter: R349/month, up to 20 active students and 1 tutor
- Centre: R649/month, up to 60 active students and 5 tutors
- Premium: R1,099/month, unlimited or high-cap students and tutors with priority support
- Trial: 60–90 days, no card required

### Planned Hybrid Pricing

- Starter: R150 base plus R8 per student/month, 1–25 students
- Growth: R250 base plus R6 per student/month, 26–75 students
- Professional: R400 base plus R5 per student/month, 76–150 students
- Enterprise: R600 base plus R4 per student/month, 150+ students, capped at R2,000/month

The product should provide a pricing calculator and a predictable migration or grandfathering approach when hybrid pricing is introduced. An optional parent premium fee of approximately R50–R75/month may be offered later.

## 8. Security, Privacy, and Compliance

- Enforce strict tenant-aware access control and prevent cross-tenant data exposure
- Protect data in transit and at rest, including student records, session notes, files, and communications
- Capture guardian consent and provide retention, deletion, export, and processing documentation appropriate to child data
- Support POPIA requirements and evaluate applicability of GDPR and COPPA for the deployment context
- Maintain audit logs for tenant, user, administrative, billing, security, and AI actions
- Provide secure tenant data exports and compliance reporting
- Provide backups, point-in-time recovery where available, disaster recovery, and tenant data integrity checks
- Apply tenant and subscription-aware rate limits and usage controls
- Escalate suspected isolation breaches and security incidents immediately to Super Admins

## 9. Technical and Operational Constraints

- Use a shared managed database with tenant-aware partitioning and row-level access controls initially; support separate schemas or dedicated databases for enterprise tenants later
- Use reliable managed authentication and secure parent-link mechanisms
- Support daily incremental backups, defined retention, and on-demand tenant exports
- Monitor errors, latency, resource usage, tenant usage, and abnormal activity; retain operational logs according to policy
- Provide self-service documentation, short walkthroughs, email support, and WhatsApp support for paying centres
- Provide stronger support commitments for Premium and Enterprise plans
- Isolate high-usage tenants through rate limits and scaling controls

## 10. Delivery and Infrastructure Requirements

- Use protected `main` and `staging` branches with short-lived feature branches, pull requests, reviews, and required CI checks
- Run automated linting, tests, builds, deployment health checks, and staging end-to-end tests
- Require approval for production deployment and use immutable release artifacts
- Provision infrastructure as code with separate staging and production environments
- Use managed application hosting, PostgreSQL, object storage, CDN, secrets management, and monitoring
- Run backwards-compatible database migrations with pre-deployment backups and an expand-then-contract approach
- Support rolling or blue/green deployments, smoke tests, immutable-image rollback, and a documented recovery runbook
- Alert on elevated errors, database failures, failed deployments, backup failures, and unhealthy services
- Control MVP cost through small instances, staging scale-down, storage lifecycle rules, image cleanup, and usage monitoring

## 11. Initial Success Metrics

- Trial activation: percentage of centres generating an invoice within 30 days
- Retention: monthly paying-centre churn, target below 4% after launch
- Engagement: sessions logged per active student per month
- Revenue: MRR, ARPA, and CAC payback
- Parent delivery: percentage of approved sessions successfully delivered to parents
- Operational efficiency: time required for a centre to generate term invoices

## 12. Open Decisions

- Confirm browser support targets and minimum supported mobile browsers
- Confirm final approach for parent magic links versus accounts and student authentication
- Define tutor availability conflict rules and admin override behaviour
- Confirm payment-provider selection and reconciliation timing
- Confirm data retention, deletion, export, and archival periods
- Confirm VAT display and handling policy
- Confirm whether launch pricing or hybrid pricing is used at initial release