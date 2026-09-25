# Teacher Helper MVP Data Model

All entities are tenant-scoped unless explicitly marked platform-scoped. Every tenant-scoped table
MUST carry `centre_id` and be protected by database row-level policies. Identifiers are opaque and
non-sequential in external links.

## Centre and Access

### Centre

- `id`, `name`, `status`, `branding`, `billing_settings`, `notification_settings`, `timezone`,
  `created_at`, `updated_at`
- `status`: `onboarding`, `trial`, `active`, `suspended`, `archived`
- `name` uniqueness is enforced for active operational workspaces according to the configured
  identity rule.
- Relationships: has users, students, guardians, tutors, sessions, invoices, files, and policies.

### User

- `id`, `email`, `display_name`, `authentication_status`, `last_seen_at`, `created_at`
- Authentication identity is managed by the selected platform; domain access is represented by
  memberships rather than inferred from email alone.

### CentreMembership

- `id`, `centre_id`, `user_id`, `role`, `status`, `invited_at`, `accepted_at`, `revoked_at`
- `role`: `owner`, `admin`, `tutor`
- `status`: `invited`, `active`, `revoked`, `expired`
- A user may belong to multiple centres, but every request resolves exactly one active centre scope.

## People and Safeguarding

### Student

- `id`, `centre_id`, `reference`, `name`, `date_of_birth`, `enrolment_status`, `academic_info`,
  `accommodations`, `goals`, `visibility_policy`, `created_at`, `updated_at`
- `enrolment_status`: `enquiry`, `active`, `paused`, `withdrawn`, `archived`
- Student references are unique within a centre and are never used as access-link tokens.

### Guardian

- `id`, `centre_id`, `name`, `whatsapp_number`, `whatsapp_number_status`, `relationship_status`,
  `created_at`, `updated_at`
- `whatsapp_number_status`: `unconfirmed`, `code_pending`, `confirmed`, `revoked`
- The normalized number is unique within a centre where active; changes invalidate prior confirmation
  and future protected delivery until re-confirmed.

### GuardianStudent

- `id`, `centre_id`, `guardian_id`, `student_id`, `relationship`, `visibility_policy`,
  `relationship_confirmed_at`, `relationship_confirmed_by`, `status`
- `status`: `pending`, `active`, `revoked`
- Protected delivery requires an active relationship, confirmed relationship, confirmed WhatsApp
  number, and valid consent where required.

### ConsentRecord

- `id`, `centre_id`, `student_id`, `guardian_id`, `purpose`, `decision`, `recorded_at`, `expires_at`,
  `withdrawn_at`, `recorded_by`
- `decision`: `granted`, `restricted`, `withdrawn`
- Every protected visibility decision resolves the latest applicable consent record.

### VerificationChallenge

- `id`, `centre_id`, `guardian_id`, `channel`, `purpose`, `code_digest`, `expires_at`, `attempt_count`,
  `status`, `confirmed_at`
- Codes are stored as digests, expire, have bounded attempts, and cannot be reused.

## Tutoring and Delivery

### TutorAssignment

- `id`, `centre_id`, `student_id`, `tutor_user_id`, `status`, `starts_at`, `ends_at`, `assigned_by`
- `status`: `pending`, `active`, `paused`, `ended`
- Historical sessions retain authorship after an assignment ends.

### Session

- `id`, `centre_id`, `student_id`, `tutor_user_id`, `occurred_at`, `duration_minutes`, `subject`,
  `topics`, `attendance`, `notes`, `homework`, `next_focus`, `review_status`, `approved_at`,
  `approved_by`, `version`, `created_at`, `updated_at`
- `review_status`: `draft`, `submitted`, `approved`, `rejected`, `superseded`
- Parent-visible content is derived from the centre visibility policy and approval state.

### Resource

- `id`, `centre_id`, `session_id`, `name`, `storage_reference`, `content_type`, `size_bytes`,
  `visibility`, `created_by`, `created_at`
- Files are stored in protected object storage; the database stores references and authorization
  metadata, not public file URLs.

### AccessLink

- `id`, `centre_id`, `guardian_id`, `student_id`, `record_type`, `record_id`, `token_digest`,
  `status`, `sent_at`, `expires_at`, `opened_at`, `revoked_at`, `last_failure_at`
- `record_type`: `session`, `resource`, `invoice`, `receipt`
- `status`: `pending`, `active`, `expired`, `revoked`, `consumed`
- The token is opaque, single-record, seven-day, revocable, and never stores protected content.
  Access checks re-evaluate relationship, consent, record visibility, and centre scope at open time.

### Notification

- `id`, `centre_id`, `guardian_id`, `student_id`, `access_link_id`, `kind`, `template_key`,
  `provider_message_id`, `status`, `attempt_count`, `last_attempt_at`, `delivered_at`, `failed_at`,
  `failure_reason`, `created_at`
- `kind`: `session_update`, `invoice`, `verification`, `delivery_failure`
- `status`: `queued`, `sending`, `delivered`, `failed`, `retrying`, `cancelled`
- Provider event identifiers are unique to enforce idempotent webhook processing.

## Billing

### Invoice

- `id`, `centre_id`, `student_id`, `family_reference`, `period_start`, `period_end`, `currency`,
  `line_items`, `subtotal`, `tax_amount`, `total`, `due_at`, `status`, `document_reference`,
  `created_by`, `created_at`, `updated_at`
- `currency` is `ZAR` for MVP.
- `status`: `draft`, `issued`, `partially_paid`, `paid`, `disputed`, `failed`, `cancelled`
- Amounts use decimal-safe storage and are immutable after issue except through an audited correction
  or cancellation workflow.

### Payment

- `id`, `centre_id`, `invoice_id`, `method`, `amount`, `currency`, `received_at`, `reference`,
  `status`, `recorded_by`, `created_at`
- `method`: `eft`, `cash`, `other`
- Manual payments require an authorised centre role and produce an audit event and receipt state.

## Operations and Governance

### AuditEvent

- `id`, `centre_id`, `actor_user_id`, `event_type`, `entity_type`, `entity_id`, `request_id`,
  `metadata`, `occurred_at`, `retention_class`
- Captures identity, permission, data, notification, billing, export, security, administrative,
  and recovery actions. Metadata MUST exclude secrets and protected content not needed for review.

### ExportRequest

- `id`, `centre_id`, `requested_by`, `scope`, `status`, `storage_reference`, `requested_at`,
  `completed_at`, `expires_at`, `failure_reason`
- `status`: `requested`, `processing`, `ready`, `failed`, `expired`, `deleted`
- Export generation, download, expiry, and deletion are audited.

### RetentionPolicy

- `id`, `retention_class`, `retention_period`, `legal_hold`, `effective_at`, `updated_by`
- `retention_class`: `student_session`, `billing`, `audit`
- Policies are centrally defined for MVP; centres cannot shorten or extend them outside approved
  platform rules. Exact durations are a pre-production compliance decision.

## Key State Transitions

- Centre: `onboarding -> trial -> active -> suspended/archived`
- Membership: `invited -> active -> revoked/expired`
- Guardian number: `unconfirmed -> code_pending -> confirmed -> revoked`
- Relationship: `pending -> active -> revoked`
- Session: `draft -> submitted -> approved/rejected -> superseded`
- Access link: `pending -> active -> expired/revoked`; an active link may be replaced by a fresh link.
- Notification: `queued -> sending -> delivered` or `retrying -> failed`; duplicate provider events
  do not advance state twice.
- Invoice: `draft -> issued -> partially_paid/paid/disputed/failed/cancelled`
- Export: `requested -> processing -> ready -> expired/deleted` or `failed`

## Cross-Cutting Validation Rules

- Tenant scope is required on every protected query, file reference, background job, and audit event.
- Role permission and record relationship are both required; a valid link cannot bypass current
  consent, visibility, revocation, or expiry checks.
- Protected information is never placed in access-link tokens, message previews, logs, or error text.
- All timestamps are stored consistently and rendered using the centre or recipient locale policy.
- Destructive changes and retention deletion are soft-state transitions until the documented deletion
  job and audit requirements are satisfied.
