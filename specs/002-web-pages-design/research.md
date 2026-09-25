# Research: Web Pages and Design System Application

## Decision: Keep the existing single-app page families

**Rationale**: The repository already contains public, authentication, centre, tutor, guardian, billing, export, and operations routes in one Next.js App Router application. A shared page-shell and navigation contract can improve consistency without introducing a second frontend, a new routing abstraction, or duplicated authorization behavior.

**Alternatives considered**:

- A separate marketing site was rejected because it would split the public entry experience from the product navigation and duplicate the design language.
- A new frontend or component library was rejected because the current app already has shared components, CSS, artwork, and route groups that can be refined locally.
- A route-only cleanup was rejected because page hierarchy, states, responsive behavior, focus, and visual consistency are part of the requested user value.

## Decision: Keep public educational links as home-page sections

**Rationale**: The clarification answer selects in-page `How it works` and `Trust and privacy` sections. This keeps the public entry experience focused, preserves the primary sign-up and log-in actions, and avoids creating thin standalone pages before the content warrants them. Anchor destinations remain part of the page-map contract and must be tested like links to other pages.

**Alternatives considered**:

- Two standalone public pages were rejected for the initial release because they increase navigation depth and page maintenance without a stated need for longer content.
- A mixed model was rejected because it would make the public navigation hierarchy inconsistent and would require a separate decision about which content belongs in which shell.

## Decision: Use the existing design guide as a testable UI contract

**Rationale**: The design document already defines the visual direction: content-first hierarchy, crisp micro-borders, restrained accent colors, compact controls, purposeful line-art, accessible icon names, responsive layouts, focus treatment, and reduced motion. Converting those rules into page-surface and browser-check contracts makes them reviewable instead of subjective.

**Alternatives considered**:

- A new visual theme was rejected because it would conflict with the existing Teacher Helper artwork and previously implemented landing direction.
- Treating design as a manual review only was rejected because responsive overflow, link integrity, focus, and reduced motion can be checked repeatedly with browser automation.

## Decision: Use CSS Modules plus document-level global styles

**Rationale**: The current public page already uses a page CSS module and the root layout owns document-level styles. CSS Modules keep page composition local while a small global stylesheet handles body reset, typography defaults, and document behavior. This matches the existing toolchain and avoids a new styling dependency.

**Alternatives considered**:

- A utility CSS framework was rejected because it would add setup and class complexity for a focused page-family pass.
- Inline styles were rejected because they make responsive behavior, focus states, reduced motion, and shared tokens harder to maintain.

## Decision: Validate the page family at desktop and mobile sizes

**Rationale**: The constitution and feature spec require usable desktop and phone workflows. Playwright already defines Chromium desktop and iPhone projects, so browser checks can cover home links, page headings, role-sensitive navigation, no horizontal overflow, keyboard focus, and reduced-motion behavior without changing the test stack.

**Alternatives considered**:

- Desktop-only checks were rejected because guardian and responsive requirements are central to the feature.
- Pixel-perfect screenshot comparison as the only gate was rejected because it is brittle and does not prove link behavior, focus, role scope, or protected-state content.

## Decision: Preserve existing authorization and data boundaries

**Rationale**: This feature is about page surfaces, navigation, content hierarchy, and design behavior. Existing tenant context, role authorization, guardian verification, access links, billing, storage, audit, and provider contracts remain authoritative. Page changes must call those existing boundaries rather than recreate them in presentation code.

**Alternatives considered**:

- Moving authorization into navigation alone was rejected because hidden links are not a security boundary.
- Adding new page-specific data rules was rejected because it would duplicate domain policy and increase safeguarding risk.
