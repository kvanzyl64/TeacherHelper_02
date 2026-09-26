# Implementation Plan: Web Pages and Design System Application

**Branch**: `002-web-pages-design` | **Date**: 2026-09-25 | **Spec**: [spec.md](spec.md)

## Summary

Complete the Teacher Helper page family around the clarified public entry flow and the existing MVP role boundaries. The public home page will link to in-page `How it works` and `Trust and privacy` sections, while authenticated, tutor, guardian, billing, and oversight surfaces will receive consistent navigation, page states, responsive behavior, and accessible interaction treatment. The implementation reuses the existing Next.js App Router, page routes, CSS modules, global styles, shared SVG icon sprite, and line-art characters.

The design is guided by [Web Design pricipals.md](../001-teacher-helper-mvp/Web%20Design%20pricipals.md) and uses the implemented landing page in `apps/web/app/page.tsx`, `apps/web/app/page.module.css`, and `apps/web/app/globals.css` as the canonical visual reference: editorial hierarchy, crisp structural rules, paper-and-ink surfaces, restrained accents, small stable controls, purposeful artwork, visible focus, and reduced motion. Existing domain authorization and data contracts remain unchanged.

## Technical Context

**Language/Version**: TypeScript 5.x with React and Next.js App Router 15.x

**Primary Dependencies**: Next.js, React, CSS Modules, project global CSS, shared SVG icon sprite, existing line-art SVG assets, Vitest, and Playwright

**Storage**: Existing PostgreSQL-backed domain and integration packages; this feature adds no schema or storage changes

**Testing**: Vitest for existing domain/contract regression coverage; Playwright Chromium and mobile projects for page links, responsive layout, keyboard focus, reduced motion, and page-state checks

**Target Platform**: Desktop and mobile browsers, with phone layouts validated from approximately 360 CSS pixels wide upward

**Project Type**: Multi-tenant web application with public, authenticated, tutor, guardian, billing, and oversight page families

**Performance Goals**: Public and role page entry should remain responsive at pilot load; representative pages must expose required content without layout shift, horizontal scrolling, or blocked actions, and existing dashboard interaction targets remain p95 under 500 ms

**Constraints**: Preserve tenant, role, consent, single-record guardian-link, audit, storage, notification, billing, and recovery boundaries. Do not add public parent accounts or new business rules. Follow the design guide, including accessible names, visible focus, reduced motion, and non-color-only status communication.

**Scale/Scope**: Public home page plus the existing authentication, onboarding, centre, tutor, guardian, billing, export, and operations page surfaces; representative states include loading, empty, populated, unavailable, denied, expired, revoked, failed, and complete.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Tenant isolation and least privilege**: PASS. Navigation and page states must derive from the existing centre and role scope and must never reveal protected records or unauthorized destinations.
- **Privacy and safeguarding**: PASS. Guardian pages remain passwordless, single-record, consent-aware, expiry-aware, and generic when unavailable. Child and billing content is not added to public surfaces.
- **Human-controlled AI**: PASS. This feature adds no AI output or educational content generation.
- **Testable and observable delivery**: PASS. Page links, states, responsive behavior, focus, reduced motion, and existing domain regressions are covered by automated checks and the quickstart evidence checklist.
- **Accessible and reliable workflows**: PASS. The design contract requires mobile/desktop support, visible focus, stable controls, recoverable states, and reduced-motion behavior.
- **Security and operational constraints**: PASS. No database, authentication, storage, provider, or export boundary changes are proposed.
- **Delivery and quality gates**: PASS. The plan includes lint, typecheck, build, Vitest, and Playwright validation before release review.

No constitution violations or complexity exceptions are required.

## Phase 0: Research Decisions

Research is captured in [research.md](research.md). The key decisions are:

1. Treat the existing route/page families as the product surface and add shared page-shell, navigation, state, and design-pattern rules rather than creating a second application structure.
2. Keep `How it works` and `Trust and privacy` as home-page sections, as clarified by the user, and test the anchors as first-class public navigation destinations.
3. Use CSS Modules for page-specific composition and the existing global stylesheet for document-level reset/tokens; keep icons in the shared SVG sprite and characters as accessible secondary artwork.
4. Use Playwright browser checks at desktop and mobile sizes for page-map, link integrity, overflow, focus, and reduced-motion evidence; retain Vitest for existing domain regressions.

## Phase 1: Design Outputs

- [data-model.md](data-model.md) defines Page Surface, Navigation Link, Design Pattern, Page State, and Role Visibility records used to reason about the page family.
- [contracts/page-map.md](contracts/page-map.md) defines the UI contract for public, authenticated, tutor, guardian, billing, and oversight navigation plus required states and accessibility behavior.
- [quickstart.md](quickstart.md) provides runnable local validation scenarios and expected evidence for the page family.

## Project Structure

### Documentation (this feature)

```text
specs/002-web-pages-design/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── page-map.md
├── checklists/
│   └── requirements.md
└── tasks.md                 # Generated by /speckit-tasks
```

### Source Code (repository root)

```text
apps/web/
├── app/
│   ├── page.tsx             # Public home page and in-page public sections
│   ├── layout.tsx           # Document shell and global styles
│   ├── globals.css          # Document-level reset and shared tokens
│   ├── page.module.css      # Public home composition and responsive rules
│   ├── auth/                # Authentication and invitation entry pages
│   ├── (centre)/             # Centre navigation and owner/admin surfaces
│   ├── (tutor)/              # Tutor student and session surfaces
│   ├── (guardian)/           # Phone-first verification and single-record pages
│   └── api/                  # Existing provider callback routes
├── components/              # Shared navigation, people, guardian, and page-state UI
├── features/                # Domain-oriented UI slices
├── lib/                     # Auth, storage, observability, errors, and configuration
├── public/images/line-art/  # Shared icon sprite and role artwork
└── tests/                   # Web route and scaffold tests

packages/
├── domain/                  # Existing roles, policies, transitions, and services
├── database/                # Existing PostgreSQL migrations and repositories
├── integrations/            # Existing provider/storage adapters
└── test-support/            # Existing isolated fixtures and reset helpers

tests/
├── contract/                # Existing workflow/provider contract tests
├── integration/             # Existing tenant and workflow integration tests
└── e2e/                     # Existing Playwright browser journeys and new page-map checks
```

**Structure Decision**: Keep the single web application and package boundaries already established by the MVP. Add or refine shared page-shell, navigation, state, and accessibility behavior at the nearest existing component/page-family boundary. Keep public landing composition in `apps/web/app/page.tsx` with `page.module.css`; do not introduce a second frontend, routing abstraction, or design library for this feature.

## Implementation Phases

### Phase 0: Research

- Confirm page families and role boundaries against the MVP spec, current route tree, and design guide.
- Confirm the clarified home-page section behavior and the existing SVG artwork/icon usage rules.
- Record alternatives rejected: standalone public pages for the two educational links, a new component library, or a separate frontend.

### Phase 1: Design and Contract

- Define the page-surface and navigation-link model in `data-model.md`.
- Define the UI contract for destinations, role visibility, states, and accessibility in `contracts/page-map.md`.
- Define runnable desktop/mobile and keyboard/reduced-motion checks in `quickstart.md`.
- Re-evaluate constitution gates after the design artifacts: all remain PASS because the feature changes presentation and navigation while preserving existing authorization and data boundaries.

### Phase 2: Implementation Handoff

The implementation task list should be generated separately by `/speckit-tasks` from this plan. It should sequence public home links and sections first, shared navigation/page states second, role page-family refinements third, and browser/accessibility validation last. It must keep files that share navigation or global styling sequential and run tests before marking each vertical slice complete.

## Complexity Tracking

No entries. The plan keeps the existing application structure and introduces no new runtime abstraction or external service.
