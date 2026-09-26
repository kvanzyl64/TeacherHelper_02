# Quickstart: Web Pages and Design System Application

This guide validates the page map, home-page links, responsive behavior, shared design treatment, and protected-state expectations for feature `002-web-pages-design`.

## Prerequisites

- Node.js supported by the repository
- pnpm 10.x
- Repository dependencies installed with `pnpm install`
- Local app configuration available as described in the existing project quickstart
- No deployment database or production credentials required for public page checks

## Start the App

From the repository root:

```powershell
pnpm dev
```

Open `http://localhost:3000` in a desktop browser and a phone-sized browser context.

## Automated Regression Checks

Run the existing unit, contract, and integration suite:

```powershell
pnpm test
```

Expected result: all existing tests pass; this feature must not change tenant, identity, billing, notification, storage, or domain behavior.

Run static and production checks:

```powershell
pnpm lint
pnpm typecheck
pnpm build
```

Expected result: all commands pass. A build warning about the existing Next.js ESLint plugin configuration is non-blocking only if no lint or type error is emitted.

Run browser journeys:

```powershell
pnpm test:e2e
```

## Page-Map Scenarios

### 1. Public home navigation

1. Open `/` at desktop width.
2. Confirm the product purpose, centre audience, primary value, privacy posture, `Log in`, and `Start free`/`Create your centre` actions are visible.
3. Activate `How it works` and confirm the page moves to the `workflow` section.
4. Activate `Trust and privacy` and confirm the page moves to the `trust` section.
5. Confirm the public page does not contain dead links or protected record content.

Expected result: both educational destinations remain sections on the home page, while authentication and centre creation remain clear page actions.

### 2. Responsive public experience

1. Check the public home page at desktop, tablet, and approximately 360-390 CSS pixel widths.
2. Confirm the hero stacks the workspace preview below the message on narrow screens.
3. Confirm buttons, navigation, text, helper artwork, proof strip, workflow cards, and closing CTA remain inside the viewport.
4. Enable reduced motion and reload.

Expected result: no horizontal scrolling or overlap; all required content and actions remain reachable; non-essential motion is absent while meaning remains.

### 3. Authenticated page family

Using representative seeded or test fixtures, verify the owner/admin, tutor, billing, and oversight navigation described in [contracts/page-map.md](contracts/page-map.md).

Expected result: each page has a heading, current area, parent route, role-appropriate actions, and useful empty/failure/unavailable states. Tutor navigation does not imply owner-only billing, export, or operations access.

### 4. Guardian page family

Using the existing verification and access-link fixtures:

1. Open a valid verification challenge on a phone-sized viewport.
2. Open a valid session, resource, invoice, or receipt link.
3. Repeat with expired, revoked, invalid, denied, and failed states.
4. Rotate or resize the viewport and inspect text, controls, and required actions.

Expected result: valid pages show only the permitted single record; unavailable pages are generic, provide safe recovery guidance, and reveal no protected record details; no page scrolls horizontally.

### 5. Keyboard and state review

1. Navigate each representative page using only the keyboard.
2. Confirm focus is visible and moves in a sensible order.
3. Inspect loading, empty, populated, success, unavailable, denied, expired, revoked, and failed states where available.
4. Confirm status meaning is available in text or accessible naming and is not conveyed by color or artwork alone.

Expected result: all required actions are reachable, focus is not obscured, and every state explains what happened and what the user can do next.

## Evidence to Record

For release review, record:

- Browser and viewport used for public, staff, tutor, and guardian checks.
- Links visited and their resulting page/section destinations.
- Any role navigation included or excluded.
- Horizontal overflow result at narrow width.
- Keyboard focus and reduced-motion result.
- Guardian protected-content result for valid and unavailable states.
- `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, and `pnpm test:e2e` outcomes.

## Recorded Validation Evidence

Executed successfully in the repository on 2026-09-26:

- `pnpm test` → 25 test files passed, 45 tests passed.
- `pnpm lint; pnpm typecheck; pnpm build` → all three commands passed after fixing the async route params contract in [apps/web/app/(guardian)/verify/[challenge]/page.tsx](../../apps/web/app/(guardian)/verify/[challenge]/page.tsx) and [apps/web/app/(guardian)/link/[token]/page.tsx](../../apps/web/app/(guardian)/link/[token]/page.tsx).
- `npx playwright test tests/e2e/design-system.spec.ts tests/e2e/design-system-accessibility.spec.ts --project=chromium` → 4 passed tests in 34.8s across the desktop design-system checks.

Additional release evidence:

- Public routes checked: `/`, `/dashboard`, `/verify/challenge-1` at desktop and 390px phone width; no horizontal overflow detected.
- Keyboard/focus checks passed: main navigation links and the guardian verification form remained visible and focusable using the documented tab/focus flow.
- Guardian states validated: valid verification page rendered the expected self-service form, and unavailable/expired states in the link flow rendered the generic protected-state messaging without leaking record details.
- Production build generated the full app route map, including dynamic guardian and link pages, without route errors.

See [data-model.md](data-model.md) for page-surface/state terminology and [contracts/page-map.md](contracts/page-map.md) for the normative UI contract.
