# Data Model: SaaS Admin

This feature adds a platform-level administration model rather than changing the centre model. Existing centre, membership, billing, and audit entities remain authoritative for detailed tenant records.

## Managed OIDC Identity

Identity is authenticated by a managed OIDC provider. PostgreSQL stores only the stable identity mapping, never provider credentials, access tokens, refresh tokens, or passwords.

| Field        | Description              | Rules                                                        |
| ------------ | ------------------------ | ------------------------------------------------------------ |
| `id`         | Internal identity ID     | UUID primary key                                             |
| `issuer`     | OIDC issuer URL          | Required and normalized                                      |
| `subject`    | Stable OIDC subject      | Required; unique with `issuer`; email is not an identity key |
| `status`     | Application access state | Active or disabled; checked on each DAL request              |
| `created_at` | Mapping creation time    | Database timestamp                                           |

One managed identity may map to a centre user and, if explicitly provisioned, a platform administrator. The provider remains the authority for authentication; application tables remain the authority for tenant membership and product roles.

## Centre User Identity Mapping

The existing `app.users` profile is linked to exactly one active `auth_identities` row by a forward-only migration. Centre memberships continue to carry centre-specific roles. Email and display name are profile/contact attributes, never proof of identity or authorization.

### Existing Schema Transition

Migration 013 is already present and includes `password_hash` and `platform_admin_sessions`. Do not modify or replay that migration. An expand migration adds the OIDC identity mapping while the owner account is created through the managed provider. After OIDC login and role resolution are verified, disable the custom password path; remove unused password/session columns and tables only in a later contract migration with tested recovery.

## Platform Admin User

A user with platform-level business or operational oversight responsibilities.

| Field                      | Description                          | Rules                                                         |
| -------------------------- | ------------------------------------ | ------------------------------------------------------------- |
| `id`                       | Platform admin identity              | Unique within the SaaS                                        |
| `identity_id`              | Managed OIDC identity                | Required FK; provisioned separately from the provider         |
| `email`                    | Contact/display address              | Not an authentication key                                     |
| `display_name`             | Name shown for operational context   | Required; not used for authorization                          |
| `role`                     | `platform_owner`                     | Only this role is enabled in release one; support is deferred |
| `status`                   | `active`, `suspended`, or `disabled` | Controls access to admin routes                               |
| `created_at`, `updated_at` | Account lifecycle timestamps         | Set by the database/application                               |

Permissions are derived from `role` in application code; they are not stored as a mutable account field. The first SaaS owner is explicitly provisioned by linking an existing managed-provider identity to this row and recording the bootstrap action.

## Managed Session

The managed identity provider owns session creation, renewal, expiry, and logout. The application validates the provider session/token on the server and resolves it to an active `auth_identities` row. Do not create another application password or session store. Any provider-specific session metadata retained locally must be justified, minimized, and must not contain bearer tokens.

### Relationships

- A platform user may review many centres.
- A platform user may resolve many alerts or support cases.
- A platform user may be limited to read-only access for support workflows.

## Centre Portfolio Record

A business-safe summary of a centre for the platform owner.

| Field                 | Description                                           | Rules                                      |
| --------------------- | ----------------------------------------------------- | ------------------------------------------ |
| `centre_id`           | Tenant identifier                                     | Unique within the SaaS                     |
| `name`                | Display name                                          | Human-readable, not sensitive child data   |
| `status`              | `trial`, `active`, `paused`, `suspended`, `flagged`   | Must match tenant status                   |
| `subscription_status` | `active`, `past_due`, `trial`, `cancelled`, `at_risk` | Derived from current billing context       |
| `owner_contact`       | Contact summary for platform follow-up                | Restricted to business contact information |
| `last_payment_at`     | Most recent successful payment                        | Visible only as business-safe summary data |
| `support_flag`        | Whether the centre needs operational attention        | Must be explicit and auditable             |

### Relationships

- A centre portfolio record belongs to one centre tenant.
- A centre may have many payment events and alerts.
- A centre may be grouped into plan and risk segments.

## SaaS Subscription (schema addition required)

Commercial relationship between the SaaS and a centre.

| Field                                                   | Description                                           | Rules                                               |
| ------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------- |
| `id`                                                    | Subscription identity                                 | UUID primary key                                    |
| `centre_id`                                             | Subscribed tenant                                     | Unique active subscription per centre; FK to centre |
| `plan_name`                                             | Customer-safe plan name                               | Controlled plan catalog reference                   |
| `status`                                                | `trial`, `active`, `past_due`, `cancelled`, `at_risk` | Validated lifecycle state                           |
| `started_at`, `trial_ends_at`, `renewal_at`, `ended_at` | Lifecycle dates                                       | Explicit and timezone-safe                          |
| `monthly_value`, `currency`                             | SaaS subscription value                               | Currency-aware numeric; ZAR for initial product     |
| `created_at`, `updated_at`                              | Record lifecycle                                      | Required timestamps                                 |

### Relationships

- One centre may have zero or one active SaaS subscription at a time.
- A subscription has payment events and audited status transitions.
- Centre invoices/payments for family tuition are not SaaS subscription revenue and must not be mixed into the platform billing summary.

## Payment Event

A business-safe billing record used for subscription and revenue tracking.

| Field                | Description                                        | Rules                                   |
| -------------------- | -------------------------------------------------- | --------------------------------------- |
| `payment_id`         | Unique identifier                                  | Must not expose child or family records |
| `centre_id`          | Affected tenant                                    | Must match the centre context           |
| `amount`             | Payment or due amount                              | Numeric, currency-aware                 |
| `status`             | `paid`, `failed`, `pending`, `overdue`, `disputed` | Must map to the billing lifecycle       |
| `occurred_at`        | Payment or event date                              | Required for arrears and trend analysis |
| `follow_up_required` | Whether owner action is needed                     | Must be explicit                        |

### Relationships

- A payment event belongs to one centre.
- A payment event is linked to a subscription and observed in admin revenue summaries.

## Operational Alert

A service or data issue requiring review by the platform owner or read-only support roles.

| Field         | Description                                                                                 | Rules                                               |
| ------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `alert_id`    | Unique alert identifier                                                                     | Required for tracking                               |
| `centre_id`   | Affected tenant                                                                             | Must be present for tenant-scoped alerts            |
| `type`        | `export_failure`, `retention_warning`, `backup_issue`, `payment_risk`, `support_escalation` | Controlled vocabulary                               |
| `severity`    | `info`, `warning`, `critical`                                                               | Must support filtering                              |
| `status`      | `open`, `acknowledged`, `resolved`                                                          | Required lifecycle state                            |
| `summary`     | Human-readable risk description                                                             | Must avoid exposing data beyond the centre boundary |
| `resolved_at` | Closure date                                                                                | Optional                                            |

### Relationships

- One alert belongs to one centre.
- Alerts can be grouped into a platform summary and filtered by severity or type.

## Support Case

A coordinated customer issue with the required follow-up and evidence trail.

| Field        | Description                                     | Rules                                             |
| ------------ | ----------------------------------------------- | ------------------------------------------------- |
| `case_id`    | Unique case identifier                          | Required                                          |
| `centre_id`  | Related tenant                                  | Required for ownership                            |
| `issue_type` | Payment, access, data, retention, or operations | Controlled category                               |
| `owner`      | Assigned platform owner or support reviewer     | Must be role-aware                                |
| `status`     | `open`, `in_review`, `resolved`                 | Required                                          |
| `summary`    | Business-safe description                       | Must not expose sensitive child or billing detail |

### Relationships

- A support case may map to one or more alerts.
- A support case may culminate in a resolved action and audit record.

## Platform Audit Event (schema addition required)

Platform-level actions cannot be written to the centre-only `app.audit_events` table with a fabricated centre ID. Use a separate platform audit record.

| Field                       | Description                             | Rules                                    |
| --------------------------- | --------------------------------------- | ---------------------------------------- |
| `id`                        | Event identity                          | UUID primary key                         |
| `actor_admin_id`            | Authenticated platform actor            | FK to `platform_admins`                  |
| `target_centre_id`          | Affected centre, if any                 | Nullable; never used to grant access     |
| `action`                    | Read-sensitive or mutating admin action | Controlled vocabulary                    |
| `outcome`                   | `allowed` or `denied`                   | Required                                 |
| `request_id`, `occurred_at` | Trace and event time                    | Required                                 |
| `metadata`                  | Minimal safe context                    | No child records, credentials, or tokens |

Platform audit data is visible only through the platform-admin service and is append-only for the application role.

## Dashboard Summary

Aggregated view that presents the platform’s health and customer status.

| Field                       | Description                         | Rules                                 |
| --------------------------- | ----------------------------------- | ------------------------------------- |
| `active_centres`            | Count of active centres             | Derived from centre portfolio state   |
| `trial_centres`             | Count of trial centres              | Derived from subscription life cycle  |
| `past_due_centres`          | Count of overdue centres            | Must reflect financial risk           |
| `open_alerts`               | Count of unresolved platform issues | Must be current and filterable        |
| `monthly_recurring_revenue` | Revenue summary                     | Business-safe aggregate only          |
| `at_risk_count`             | Count of centres needing follow-up  | Derived from billing and health rules |

### Relationships

- The dashboard summary is assembled from centre, subscription, payment, and alert data.
- It must not include child-level metrics or personally identifying information.

## Validation Rules

- Platform admin access must be role-checked before any dashboard or centre detail is rendered.
- Read-only support users must never receive edit operations or privileged billing data.
- Payment and alert records must remain scoped to their centre and never include unrelated centre records.
- Dashboard summaries must use aggregated business metrics and never leak child, guardian, or family records.
- Every admin action affecting status, billing follow-up, or incident resolution must produce an audit event.
- No route or Server Action may treat a hardcoded role, email address, or requested centre ID as proof of identity or tenant membership.
- Tenant queries must establish centre/user context transaction-locally and run under a non-owner, non-`BYPASSRLS` role.
- RLS must cover every tenant-owned table, including invoices, payments, exports, retention jobs, notifications, access links, and audit records.
- Platform-wide summaries must use a separately authorized data path and reviewed DTOs; they must not reuse tenant context as a cross-tenant bypass.
