# Platform Admin UI Contract

This contract defines the user-facing platform admin surfaces and the permission boundaries for the SaaS owner feature.

## Route Contract

### `/admin`

**Purpose**: Platform portfolio overview.

**Access**: Platform owner and assigned read-only support roles.

**Required content**:
- active centre count
- trial centre count
- overdue centre count
- open alert count
- revenue or subscription health summary
- links to finance and alert drill-down pages

**Must not include**:
- learner or guardian details
- raw centre child records
- protected billing detail beyond authorised centre context

### `/admin/billing`

**Purpose**: SaaS billing and subscription health overview.

**Access**: Platform owner; read-only support may view summary data if explicitly assigned.

**Required content**:
- subscription health by centre
- missed payment count and overdue centres
- last successful payment or billing status summary
- action links for follow-up or escalation

### `/admin/alerts`

**Purpose**: Operational alert review and classification.

**Access**: Platform owner and designated read-only support roles.

**Required content**:
- alert type and severity
- affected centre reference
- status and timestamps
- recovery action summary

### `/admin/centres/[centreId]`

**Purpose**: A single centre detail for platform follow-up.

**Access**: Platform owner only, or a restricted read-only support user if explicitly permitted.

**Required content**:
- centre status and subscription health
- payment risk summary
- open alerts and recent support activity
- safe business contact information only

**Must not include**:
- student or guardian details
- sensitive session, resource, or consent records
- unrelated centre data

## Shared UI Rules

- Every route must declare role-appropriate access before data is rendered.
- Summaries must remain business-safe and must not reveal protected child data.
- State labels must identify payment risk, service risk, and support follow-up clearly.
- Every alert or billing issue must have a follow-up path or explicit resolution state.
- Audit events must record state changes, escalations, or recovery actions.
