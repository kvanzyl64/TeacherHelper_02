# Data Model: SaaS Admin

This feature adds a platform-level administration model rather than changing the centre model. Existing centre, membership, billing, and audit entities remain authoritative for detailed tenant records.

## Platform Admin User

A user with platform-level business or operational oversight responsibilities.

| Field | Description | Rules |
|---|---|---|
| `id` | Platform admin identity | Unique within the SaaS |
| `role` | `platform_owner` or `support_readonly` | Must be explicitly assigned |
| `status` | `active`, `suspended`, or `disabled` | Controls access to admin routes |
| `permissions` | Permission bundle for admin actions | Read-only support users must never include edit scope |
| `last_login` | Last successful admin session | Used for operational review |

### Relationships
- A platform user may review many centres.
- A platform user may resolve many alerts or support cases.
- A platform user may be limited to read-only access for support workflows.

## Centre Portfolio Record

A business-safe summary of a centre for the platform owner.

| Field | Description | Rules |
|---|---|---|
| `centre_id` | Tenant identifier | Unique within the SaaS |
| `name` | Display name | Human-readable, not sensitive child data |
| `status` | `trial`, `active`, `paused`, `suspended`, `flagged` | Must match tenant status |
| `subscription_status` | `active`, `past_due`, `trial`, `cancelled`, `at_risk` | Derived from current billing context |
| `owner_contact` | Contact summary for platform follow-up | Restricted to business contact information |
| `last_payment_at` | Most recent successful payment | Visible only as business-safe summary data |
| `support_flag` | Whether the centre needs operational attention | Must be explicit and auditable |

### Relationships
- A centre portfolio record belongs to one centre tenant.
- A centre may have many payment events and alerts.
- A centre may be grouped into plan and risk segments.

## Subscription

Commercial relationship between the SaaS and a centre.

| Field | Description | Rules |
|---|---|---|
| `plan_name` | Subscription plan name | Must be customer-safe and not reveal internal billing logic |
| `status` | `trial`, `active`, `past_due`, `cancelled`, `at_risk` | Derived from account lifecycle |
| `renewal_date` | Next billing date | Business-safe summary only |
| `monthly_value` | Billing amount | Must respect billing rules and currency constraints |
| `seat_count` | Active seats or usage units | Derived from centre activity |

### Relationships
- One centre may have zero or one active subscription record at a time.
- A subscription may have many payment events and escalation records.

## Payment Event

A business-safe billing record used for subscription and revenue tracking.

| Field | Description | Rules |
|---|---|---|
| `payment_id` | Unique identifier | Must not expose child or family records |
| `centre_id` | Affected tenant | Must match the centre context |
| `amount` | Payment or due amount | Numeric, currency-aware |
| `status` | `paid`, `failed`, `pending`, `overdue`, `disputed` | Must map to the billing lifecycle |
| `occurred_at` | Payment or event date | Required for arrears and trend analysis |
| `follow_up_required` | Whether owner action is needed | Must be explicit |

### Relationships
- A payment event belongs to one centre.
- A payment event is linked to a subscription and observed in admin revenue summaries.

## Operational Alert

A service or data issue requiring review by the platform owner or read-only support roles.

| Field | Description | Rules |
|---|---|---|
| `alert_id` | Unique alert identifier | Required for tracking |
| `centre_id` | Affected tenant | Must be present for tenant-scoped alerts |
| `type` | `export_failure`, `retention_warning`, `backup_issue`, `payment_risk`, `support_escalation` | Controlled vocabulary |
| `severity` | `info`, `warning`, `critical` | Must support filtering |
| `status` | `open`, `acknowledged`, `resolved` | Required lifecycle state |
| `summary` | Human-readable risk description | Must avoid exposing data beyond the centre boundary |
| `resolved_at` | Closure date | Optional |

### Relationships
- One alert belongs to one centre.
- Alerts can be grouped into a platform summary and filtered by severity or type.

## Support Case

A coordinated customer issue with the required follow-up and evidence trail.

| Field | Description | Rules |
|---|---|---|
| `case_id` | Unique case identifier | Required |
| `centre_id` | Related tenant | Required for ownership |
| `issue_type` | Payment, access, data, retention, or operations | Controlled category |
| `owner` | Assigned platform owner or support reviewer | Must be role-aware |
| `status` | `open`, `in_review`, `resolved` | Required |
| `summary` | Business-safe description | Must not expose sensitive child or billing detail |

### Relationships
- A support case may map to one or more alerts.
- A support case may culminate in a resolved action and audit record.

## Dashboard Summary

Aggregated view that presents the platform’s health and customer status.

| Field | Description | Rules |
|---|---|---|
| `active_centres` | Count of active centres | Derived from centre portfolio state |
| `trial_centres` | Count of trial centres | Derived from subscription life cycle |
| `past_due_centres` | Count of overdue centres | Must reflect financial risk |
| `open_alerts` | Count of unresolved platform issues | Must be current and filterable |
| `monthly_recurring_revenue` | Revenue summary | Business-safe aggregate only |
| `at_risk_count` | Count of centres needing follow-up | Derived from billing and health rules |

### Relationships
- The dashboard summary is assembled from centre, subscription, payment, and alert data.
- It must not include child-level metrics or personally identifying information.

## Validation Rules

- Platform admin access must be role-checked before any dashboard or centre detail is rendered.
- Read-only support users must never receive edit operations or privileged billing data.
- Payment and alert records must remain scoped to their centre and never include unrelated centre records.
- Dashboard summaries must use aggregated business metrics and never leak child, guardian, or family records.
- Every admin action affecting status, billing follow-up, or incident resolution must produce an audit event.
