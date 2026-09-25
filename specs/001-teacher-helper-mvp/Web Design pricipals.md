# Web Design Principles

This design system and style guide is tailored for an AI web generator or assistant. Use it as a
core style guideline for generated screens and interfaces.

## 1. Core Visual Aesthetics and Design Philosophy

### Philosophy

Create a minimalist, content-first, high-density interface focused on speed, clarity, and visual
precision.

### Layout Structure

- Use generous white space or dark space.
- Maintain strong grid alignment.
- Use crisp structural containers.
- Prefer subtle `1px` micro-borders over heavy drop shadows.

### Aesthetic Tone

Aim for modern software craft, developer-grade precision, and high-end SaaS elegance. Draw
inspiration from products such as Linear, Notion, Raycast, and Figma.

## 2. Color Palette and Surface Hierarchy

### Base Palette: Dark and Light Mode

- **Primary background:** Clean neutral black (`#09090B`) or crisp white (`#FFFFFF`). Avoid noisy,
  pure black full-surface backgrounds; use subtle zinc or slate undertones.
- **Surface containers:** Use glassmorphism or a flat, subtly tinted surface such as `#121215` or
  `#F4F4F5`, with semi-transparent, low-contrast borders.
- **Primary text:** High contrast, such as `#FAFAFA` or `#09090B`.
- **Secondary text:** Muted neutral gray, such as `#A1A1AA` or `#71717A`.
- **Tertiary text and captions:** Low-contrast neutral gray, such as `#52525B` or `#A1A1AA`.
- **Accent colors:** Use accents selectively for interactive states, focused items, and badges. Good
  options include electric violet, neon indigo, bright cyan, and high-octane orange.

## 3. Typography and Micro-Typography

### Font Family

Use a modern neutral sans-serif or variable font, such as Inter, SF Pro, Geist, or Plus Jakarta
Sans.

### Font Weights

- **Headings:** Medium (`500`) to semi-bold (`600`). Avoid overly heavy weights to maintain
  elegance.
- **Body:** Regular (`400`) with tight line heights between `1.4` and `1.5`.
- **Interactive elements, code, and metadata:** Use a monospace font such as JetBrains Mono or SF
  Mono for keyboard shortcuts, data points, badges, and inline chips.

### Letter Spacing

- Use slightly tight tracking on large headings, approximately `-0.02em`.
- Use uppercase tracking on small labels, approximately `+0.05em`.

## 4. Components and Micro-Interactions

### Navigation and Command Panels

- **Command palette:** Use a floating bar or modal centered on the screen with a search input,
  inline shortcuts such as `Cmd+K`, and instant optimistic updates.
- **Toolbars:** Use unobtrusive floating toolbars with subtle hover backgrounds, rounded corners,
  and minimal icon-only buttons with tooltips.

### Cards and Containers

- **Borders:** Use thin, crisp borders such as
  `1px solid rgba(255, 255, 255, 0.1)`.
- **Corner radius:**
  - Small UI elements such as buttons, inputs, and badges: `6px` to `8px`.
  - Containers and cards: `12px` to `16px`.
- **Shadows:** Use minimal, soft ambient elevation such as
  `0 10px 30px -10px rgba(0, 0, 0, 0.5)`.

### Interactive States and Motion

- **Hover effects:** Use subtle brightness shifts or low-opacity white or black overlays with a
  transition of `all 0.15s ease`.
- **Animations:** Use snappy, optimistic transitions between `150ms` and `250ms`, with cubic-bezier
  easing. Avoid long or sluggish animations.
- **Keyboard navigation:** Provide clear visual feedback for focused items, including explicit focus
  rings or border-color changes.

## 5. UI Layout Principles for AI Generation

- **Focus on direct content:** Eliminate unnecessary decorative elements. Every visual element must
  serve a functional purpose.
- **Maintain high information density:** Use tight padding and well-structured grids to present
  complex information cleanly without making the interface feel cramped.
- **Use conversational, step-by-step UI:** For long workflows or forms, present content sequentially
  or in a single-focus layout with clear progress indicators.

## 6. Teacher Helper Artwork and Icons

Use the existing line-art asset library in `apps/web/public/images/line-art/` across generated web
pages when a visual cue improves orientation or makes a workflow feel more human.

### Animated Characters

- Use the role-relevant character artwork for onboarding, empty states, success states, and friendly
  guidance: tutor, student, guardian, centre owner, or learning helper.
- Keep characters secondary to the task content. Do not use them to replace labels, instructions,
  status text, or required actions.
- Preserve the existing accessible SVG `title` and `desc` elements when embedding character assets.
- Preserve the built-in subtle animation and its `prefers-reduced-motion: reduce` behaviour. New
  character motion must be calm, short, purposeful, and never required to understand or complete a
  workflow.
- Do not use animated characters on sensitive error, safeguarding, access-denied, or payment-failure
  states unless the illustration clearly supports the recovery action and does not trivialize the
  problem.

### Icon System

- Use the shared sprite at `/images/line-art/icons.svg` through SVG `<use>` references for product
  navigation, actions, statuses, and metadata before creating new icons.
- Use the existing symbols for consistent meaning, stroke weight, and accent treatment. Add a new
  symbol only when no existing symbol expresses the action or object clearly.
- Icon-only controls MUST have an accessible name and a tooltip when the meaning is not obvious.
  Decorative icons MUST use `aria-hidden="true"`.
- Keep icons visually subordinate to labels and content. Do not use icons as the only signal for
  success, warning, failure, permission, or payment status; pair them with text or another
  accessible status cue.
- Preserve the asset library's restrained accent colours: coral, cyan, green, soft violet, amber,
  and blush. Avoid adding unrelated icon styles or mixed stroke weights.

## Instructions for the AI Web Generator

Apply this style guide across all generated screens, components, layout grids, and CSS or Tailwind
definitions. Use the existing character and icon assets described above where appropriate. Ensure
strict adherence to the typography hierarchy, sub-pixel border details, optimistic motion,
reduced-motion behaviour, accessible naming, and minimalist layout structures.
