# UI Contract: Teacher Helper Page Map

This contract defines the user-visible destinations and navigation behavior for the web-pages and design-system feature. It is not an authorization implementation; every protected destination must still enforce the existing tenant and role policies.

## Public Contract

| Source | Link label | Destination | Required result |
|---|---|---|---|
| Public home | `Log in` | Authentication entry | User reaches the staff authentication page and can return home |
| Public home | `Start free` / `Create your centre` | Centre creation entry | User reaches the centre setup entry point |
| Public home | `How it works` | Home-page section `workflow` | Page scrolls to the workflow explanation without losing primary actions |
| Public home | `Trust and privacy` | Home-page section `trust` | Page scrolls to trust/privacy proof without exposing protected records |

The public home page must show the product mission, centre audience, primary value, privacy posture, and the two primary actions before sign-in. The two explanatory links remain in-page sections for the initial release.

## Authenticated Staff Contract

| Page family | Representative destinations | Required navigation behavior |
|---|---|---|
| Centre | Onboarding, dashboard, people, team invite, centre settings | Show active centre context, current area, parent route, and role-permitted next actions |
| Tutor | Assigned students, sessions, session resources | Show assignment scope and session actions; do not imply owner-only billing, export, or operations access |
| Billing | Invoices, payments, receipts | Keep record relationships and statuses clear; expose safe correction, cancellation, or recovery actions allowed by the MVP |
| Oversight | Exports, operations alerts | Show centre-scoped status, unresolved issue/action, and protected recovery path |

Every nested surface must provide:

- A descriptive heading and current navigation state.
- A route to its parent area and next permitted action.
- A visible empty/loading/failure/unavailable state when applicable.
- No protected content or link visibility based solely on client-side navigation.

## Guardian Contract

| Destination | Success state | Unavailable state |
|---|---|---|
| Verification challenge | Explain code entry, retry/confirmation state, and next step | Generic invalid/expired/attempt-limit message without protected details |
| Session/resource link | Show only the approved single record and permitted fields | Generic expired, revoked, denied, or unavailable message with safe recovery guidance |
| Invoice/receipt link | Show only the linked billing record and permitted receipt details | Generic unavailable message without family or invoice existence disclosure |

Guardian pages must be phone-first, passwordless for MVP, usable without horizontal scrolling, and free of general centre navigation.

## Shared Design Contract

- Use the project design guide as the source of truth for hierarchy, spacing, typography, surfaces, borders, accents, artwork, icons, motion, and focus.
- Use existing line-art and icon-sprite assets where they clarify a role, workflow, state, or next action; preserve accessible SVG metadata and provide text for meaning that cannot be inferred from the image.
- Use primary and secondary action hierarchy consistently. Sign-in remains available but visually quieter than the public create-centre action.
- Use crisp structural dividers, stable control dimensions, small radii, and restrained shadows. Do not make a generic centred card or gradient the primary page composition.
- Support desktop, tablet, and narrow phone layouts. Long labels, names, translated copy, and error messages must wrap without horizontal scrolling or overlap.
- Provide visible keyboard focus and a reduced-motion mode that removes non-essential motion without removing state meaning.
- Do not communicate permission, success, warning, failure, payment, or safeguarding status by color alone.

## Required Test Evidence

A page-map implementation is accepted only when browser or route checks demonstrate:

1. Every public home-page link resolves to its contract destination.
2. Role navigation includes permitted destinations and excludes owner-only destinations for tutors.
3. Nested pages expose title, parent route, current location, and next/recovery action.
4. Guardian valid and unavailable states do not disclose protected content outside the permitted record.
5. Representative surfaces remain usable at desktop and mobile widths without horizontal overflow.
6. Keyboard focus and reduced-motion behavior remain visible and understandable.
