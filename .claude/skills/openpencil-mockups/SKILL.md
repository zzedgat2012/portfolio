---
name: openpencil-mockups
description: Use when creating, reading, updating or exporting UI mockups, wireframes or design-system components in OpenPencil, or when a task mentions mockup, frame, canvas, Figma file or the design/ folder.
---

# OpenPencil mockups

All mockups for `DESIGN.md` live in OpenPencil, an open-source design editor. Claude Code reaches it through
the `open-pencil` MCP server configured in `.mcp.json` (read-only tools are pre-approved and `eval` is denied
in `.claude/settings.json`).

## Preconditions

- The OpenPencil **desktop app must be open** with `design/portfolio.fig` loaded; the MCP server discovers
  the running app. If tools fail with a connection error, ask the developer to open the app and the file.
- The npm package `@open-pencil/mcp` must match the app version.

## File layout

```text
design/
  portfolio.fig          single source file for all mockups
  exports/               PNG/SVG exports referenced by stories and PRs (generated)
```

Pages inside `portfolio.fig`:

| Page | Contents |
| --- | --- |
| `00 Foundations` | variables (color, type, spacing, radius) mirroring `DESIGN.md` tokens |
| `01 Components` | `shared/ui` primitives and every page-section block (`HeroBlock`, `GalleryBlock`…) |
| `02 Screens` | one frame per route and breakpoint, named `<route> / <breakpoint>` (e.g. `project-detail / mobile`) |
| `99 Archive` | superseded frames; never deleted |

## How to work on the canvas

- Read before writing: `list_pages`, `get_page_tree`, `find_nodes`. Edit existing nodes instead of drawing
  duplicates.
- Build from components and variables, never from raw values: a color is a variable, a button is an instance.
- Component names match code names: `ProjectCard` in the canvas = `ProjectCard.tsx`; section blocks use the
  block component name (`HeroBlock` for the `hero` section type).
- Use auto layout for anything that will become flex/grid in code.
- After a change: `save_file`, then `export_image` the touched frames to `design/exports/<frame-name>.png`.
- Never use `eval`. Never delete pages; move superseded frames to `99 Archive`.
- A mockup change that alters tokens or component rules must be reflected in `DESIGN.md` through the BMAD UX
  skill, in the same story.
