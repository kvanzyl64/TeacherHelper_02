# Data Model: Web Pages and Design System Application

This feature models user-facing page behavior rather than adding database tables. Existing tenant, role, consent, billing, notification, storage, and audit entities remain authoritative.

## Page Surface

A user-facing destination or in-page section.

| Field | Description | Rules |
|---|---|---|
| `key` | Stable page identifier such as `public-home`, `centre-dashboard`, or `guardian-link` | Unique within the page map |
| `family` | `public`, `auth`, `centre`, `tutor`, `guardian`, `billing`, or `oversight` | Determines shell and review coverage |
| `purpose` | Plain-language reason the page exists | Must be represented by the page heading and supporting copy |
| `audience` | Visitor, owner, admin, tutor, guardian, or mixed staff audience | Must match role visibility |
| `parent_key` | Parent page or navigation area | Required for nested pages; public sections use `public-home` |
| `primary_action` | Main permitted action or next step | Must be visible and recoverable |
| `states` | Supported page states | Must include all applicable loading, empty, success, unavailable, and failure states |
| `sensitivity` | `public`, `staff-scoped`, `guardian-scoped`, or `protected-record` | Determines required authorization and disclosure review |

### Relationships

- A page surface may contain many navigation links.
- A nested page has one parent surface and may link to related sibling surfaces.
- A page surface may support many page states.
- A page surface may use many design patterns.

## Navigation Link

A labelled connection between page surfaces or an in-page anchor.

| Field | Description | Rules |
|---|---|---|
| `label` | Visible accessible link name | Must describe the destination or action |
| `source_key` | Page surface containing the link | Must exist in the page map |
| `destination_key` | Target page surface, or section key for a home-page anchor | Must resolve to a purposeful destination |
| `audience` | Roles allowed to see the link | Must be narrower than or equal to the source audience |
| `visibility_reason` | Human-readable reason for role visibility | Must not be the only authorization control |
| `current_state` | Whether the destination is active/current | Must be conveyed visually and programmatically for navigation |
| `action_kind` | `navigation`, `primary-action`, `secondary-action`, or `recovery` | Determines emphasis and placement |

### Relationships

- A source page may expose many links.
- A link has one source and one destination.
- A role may see many links, but only within its current centre scope.

## Design Pattern

A reusable visual and interaction rule.

| Field | Description | Rules |
|---|---|---|
| `key` | Pattern identifier such as `page-header`, `state-panel`, or `role-nav` | Reusable across page families |
| `purpose` | User problem the pattern solves | Must be content-first and task-supporting |
| `hierarchy` | Heading, supporting copy, metadata, action, and status ordering | Must remain scannable on small screens |
| `surface` | Background, border, radius, shadow, and accent treatment | Must follow the design guide |
| `interaction` | Hover, active, focus, disabled, loading, and reduced-motion behavior | Must not hide or block required actions |
| `responsive_rule` | Reflow, stacking, wrapping, or visibility behavior | Must prevent horizontal overflow |
| `asset_rule` | Icon or character usage and accessible name behavior | Artwork is secondary and never the only status cue |

## Page State

A user-visible condition for a page surface.

| State | Required behavior |
|---|---|
| `loading` | Preserve page context and communicate that content is being prepared |
| `empty` | Explain what is missing and provide the next permitted action |
| `populated` | Show only data permitted by role, centre, relationship, and consent |
| `complete` | Confirm the action and provide the next useful destination |
| `unavailable` | Explain that the action/content cannot be used and provide safe recovery |
| `not-found` | Use a generic destination-safe message and a route home |
| `denied` | Do not reveal whether protected records exist; provide generic recovery |
| `expired` | Explain expiry without revealing protected content; offer safe resend/support guidance |
| `revoked` | Explain that access is no longer available without exposing record details |
| `failed` | Describe the failure, preserve safe context, and provide an actionable recovery path |

## Role Visibility

The page-map view of existing authorization scope.

| Role | Page families and actions |
|---|---|
| Visitor | Public home, in-page public sections, log-in, and centre creation entry |
| Owner | All centre staff surfaces plus billing, exports, operations, and recovery controls allowed by the MVP |
| Admin | Centre people, sessions, billing, team, and other explicitly permitted staff surfaces; no owner-only assumptions |
| Tutor | Assigned student and session surfaces; no owner-only billing, export, or operations navigation |
| Guardian | Verification and valid single-record linked content only; no general centre navigation or parent account |

## Validation Rules

- Every page surface has a purpose, audience, parent relationship, primary action, and applicable states.
- Every navigation link resolves to a page or the clarified home-page section and has a descriptive accessible label.
- Link visibility never replaces server-side authorization or tenant checks.
- Protected page content is not rendered before current authorization, relationship, consent, visibility, token, and expiry checks succeed.
- State copy does not disclose another centre, family, student, invoice, file, or access-link record.
- All patterns support keyboard focus, reduced motion, readable wrapping, and no horizontal scrolling at supported phone widths.
