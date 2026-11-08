---
paths:
  - "apps/web/**"
  - "DESIGN.md"
  - "design/**"
---

# Design system (loaded only for frontend and design work)

@DESIGN.md

## Rules for implementing UI

- `DESIGN.md` above is the visual contract. It is owned by the BMAD UX skill (`bmad-ux`). Do not edit it while
  implementing a story; if the story needs a change to it, stop and flag it.
- Every screen or component comes from an approved OpenPencil mockup in `design/`. Before coding, read the
  matching frame through the `open-pencil` MCP server (`get_page_tree`, `find_nodes`, `get_node`) instead of
  guessing from a screenshot. See the `openpencil-mockups` skill.
- Tokens are the bridge: colors, type, spacing and radius in `DESIGN.md` = OpenPencil variables =
  the Tailwind v4 `@theme` in `apps/web`. Use the token, never a hard-coded value.
- If code and mockup disagree, the mockup wins for layout and the `DESIGN.md` wins for tokens. If the mockup
  breaks a `DESIGN.md` rule, report it; do not silently pick one.
- Accessibility is part of the design: every Playwright locator is by role or label, so every interactive
  element needs an accessible name.
