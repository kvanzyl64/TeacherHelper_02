# Research: SaaS Admin

## Decision: Create a separate platform-admin area instead of extending the centre dashboard

**Decision**: The SaaS admin feature will live in a dedicated platform-level route family, separate from the existing centre workspace. The primary entry will be a SaaS overview dashboard that summarises centre health, subscriptions, billing health, and platform alerts. Individual centre details will be opened from that overview, but they remain tenant-scoped and never expose child records beyond the explicitly authorised context.

**Rationale**: The feature is explicitly multi-centre. The existing centre workspace is scoped to one tenant and is designed for staff and family workflows. A separate admin route is the clearest way to preserve tenant isolation while providing a business-safe overview for the platform owner.

**Alternatives considered**:
- Extend the current centre dashboard with a cross-centre filter: rejected because it would blur tenant boundaries and mix platform and tenant responsibilities.
- Add a single global “all centres” dashboard without separate route structure: rejected because it weakens role clarity and increases accidental data exposure.
- Let support staff edit centre data: rejected because the clarified access model limits the first release to platform owner access plus read-only support access.

## Decision: Keep the admin model owner-first and read-only where support access is allowed

**Decision**: The first release allows direct SaaS administration for the platform owner and optional read-only support or operations access for selected non-editing roles. No support user can edit centre settings, payment records, or protected child data.

**Rationale**: This aligns with the constitution’s tenant isolation, least privilege, and privacy requirements while still giving the business a practical operational view.

**Alternatives considered**:
- Full support access to all centre data: rejected because it expands staff blast radius and raises privacy and audit concerns.
- Platform owner only: rejected as too restrictive for a small operations team, but still valid as a future simplification.

## Decision: Use business-safe summary metrics instead of raw operational data

**Decision**: Platform dashboards will show aggregated business metrics and risk summaries rather than detailed learner, guardian, or session-level records. Centre detail pages will display only minimal context needed for support, payment, or recovery work.

**Rationale**: The platform owner needs operational decisions, not child-data access. Business-safe summaries support churn, payment risk, and service health decisions without exposing sensitive records.

**Alternatives considered**:
- Surface raw student or guardian counts in the admin dashboard: rejected because it is broader than needed and risks privacy drift.
- Add a general cross-centre search over all child records: rejected because it violates least-privilege and the product’s intended data boundaries.

## Decision: Treat billing and alert status as first-class admin views

**Decision**: The SaaS admin feature will include distinct views for revenue health, payment issues, and service alerts because these are material to owner decisions and require different follow-up actions.

**Rationale**: Payment health and operational issues differ in both business meaning and risk response. Separate views reduce confusion and improve operational follow-up.

**Alternatives considered**:
- Merge all actions into one dashboard list: rejected because it compresses different categories of urgency and reduces actionability.
- Keep the feature limited to a centre list: rejected because payment and alert status are foundational to SaaS operations.

## Decision: Use audit-first operational follow-up

**Decision**: All platform-level actions that change state, trigger a recovery workflow, or adjust billing follow-up will be recorded in an auditable trail.

**Rationale**: The constitution requires auditable, observable delivery for access, billing, security, and recovery events.

**Alternatives considered**:
- Logging only in the UI: rejected because it is not sufficient for operational proof and support review.
- Recording only final outcomes: rejected because it misses the decision trail behind escalations and recovery actions.
