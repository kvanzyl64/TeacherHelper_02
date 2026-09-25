# Line Art Asset Library

A premium, friendly asset set for Teacher Helper. The visual language is inspired by calm workspace
products and the supplied Notion references: monochrome structure, generous whitespace, round
character badges, human character moments, and restrained accent colors.

## Characters

- `/images/line-art/character-tutor.svg`
- `/images/line-art/character-student.svg`
- `/images/line-art/character-guardian.svg`
- `/images/line-art/character-owner.svg`
- `/images/line-art/character-helper.svg`

Each character has an accessible SVG title and description, uses the same bold rounded line
treatment, and includes a subtle built-in animation. Animations respect
`prefers-reduced-motion: reduce`.

## Icon Sprite

Use the shared sprite at `/images/line-art/icons.svg` with an SVG `<use>` reference:

```tsx
<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24">
  <use href="/images/line-art/icons.svg#dashboard" />
</svg>
```

Available symbols include:

`dashboard`, `people`, `student`, `guardian`, `tutor`, `sessions`, `calendar`, `message`, `whatsapp`,
`invoice`, `payment`, `receipt`, `export`, `settings`, `team`, `search`, `plus`, `edit`, `check`,
`alert`, `lock`, `eye`, `link`, `upload`, `download`, `arrow-left`, `arrow-right`, `chevron-down`,
`close`, `menu`, and `more`.

Keep new artwork at the same stroke weight and use accent colors sparingly: coral, cyan, green,
soft violet, amber, and blush.
