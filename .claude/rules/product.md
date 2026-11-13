---
# no paths: always loaded
---

# Product: portfolio platform

## Goal

Rebuild an existing portfolio website, today on WordPress (Roots stack: Bedrock + Sage + Trellis), as a
TypeScript monorepo: a **Next.js frontend** that statically generates every page from Markdown/YAML files
edited through **Decap CMS** (git-based, no database).
The public site must look and behave at least as well as the current one, rank at least as well in search,
and be easier for editors to maintain.

## Success criteria

- Every page, project, taxonomy and menu from WordPress exists as a content file in `content/`, written by an
  idempotent migrator.
- Every old WordPress URL answers with a 301 to its new route; no SEO loss at cut-over.
- Pages are server-rendered or statically generated; Core Web Vitals in the "good" range.
- Editors change content only in the Decap admin (editorial workflow: draft, review, publish); publishing
  deploys automatically, with no developer involved.
- The UI follows `DESIGN.md`, and every screen has an approved mockup in OpenPencil before it is coded.
- Every user-facing behavior is covered by a Playwright test written before the code (TDD).

## Users

- **Visitors**: recruiters, clients and peers browsing projects; mostly mobile, arriving from search.
- **Editors**: the site owner, publishing projects and pages through the Decap admin.
- **Developers and agents**: build the site following the BMAD Method and the repository rules.

## Out of scope (unless a BMAD story says otherwise)

- User accounts, comments or any write path from the public site.
- E-commerce, newsletters, analytics dashboards.
- Rewriting content: the migration moves content as it is.

## Where the truth lives

| Topic | Source of truth |
| --- | --- |
| What to build (requirements, stories, acceptance criteria) | `_bmad-output/` (BMAD artifacts) |
| How to build it (naming, structure, tests, content model, Next.js and Decap rules) | `AGENTS.md` (always loaded) |
| Rationale and long examples | `docs/conventions.md` |
| How it looks (tokens, components, rules) | `DESIGN.md` |
| What each screen looks like | OpenPencil mockups in `design/` |
| How the old site did it (last resort only, read-only) | legacy repos in `external/` (theme, Bedrock app, terraform; gitignored) |
