# PRD: WordPress → Next.js + Decap site migration

- Product: edgar-ferreira.com (personal portfolio of Edgar Ferreira, Product Engineer)
- Owner: Edgar · Date: 2026-11-08 · Status: approved for build
- Related: [architecture-site-migration.md](architecture-site-migration.md), [epics-site-migration.md](epics-site-migration.md), `DESIGN.md`, `design/exports/*`

## Problem

The portfolio runs on WordPress (Roots/Sage) in a container behind a Cloudflare Tunnel. Most of the home page
(about, experience, contact, project features) is hard-coded in the theme, so editing it needs a developer and a
deploy of PHP code. The stack is heavier than a five-page portfolio needs.

## Goal

Replace it with the static Next.js site and Decap CMS already scaffolded in this repo, with **the same content,
the same URLs, and the look of the approved OpenPencil mockups**, then switch `edgar-ferreira.com` to it.

## Users

- **Visitors** (recruiters, clients, peers; mostly mobile, from search and LinkedIn): read projects and articles,
  download the CV, contact Edgar.
- **Editor** (Edgar): edits every piece of content in the Decap admin, including the home page profile.

## Scope

### In

| Area | Requirement |
| --- | --- |
| FR1 Content | Every project (3), article (5), tag, media file and the theme's hard-coded home content exist as files in `content/`, editable in Decap. |
| FR2 Migration | An idempotent migrator in `packages/migrator` imports them from the live site (REST API + rendered pages). |
| FR3 Home | Hero, social links, featured-project carousel, About, Experience, Projects, Articles, Contact, footer, per the Home mockup. |
| FR4 Project page | `/project/<slug>/` per the Projeto mockup: back link, title, tags, demo/code links, cover, overview, key features, technologies. |
| FR5 Article page | `/article/<slug>/` per the Artigo mockup: tags, title, date, reading time, author, Markdown body with highlighted code blocks (filename + copy), share links, author card. |
| FR6 CV | `/cv/` printable A4 page per the CV mockup, plus a generated PDF linked from "Download CV". |
| FR7 404 | Branded not-found page per the 404 mockup. |
| FR8 SEO parity | Same URLs (trailing slash); titles, descriptions, canonical, Open Graph; `sitemap.xml`, `robots.txt`, RSS feed; 301s for old WordPress-only URLs (`/wp-sitemap.xml`, `/feed/`, `/sitemap.xml` alias). |
| FR9 Delivery | CI on every PR; deploy to Cloudflare on every push to `main` (so Decap publishes go live). |
| FR10 Cut-over | `edgar-ferreira.com` and `www` served by the new site; `www` redirects to the apex; old URLs answer 200 or 301. |

### Out

Comments, search, analytics dashboards, i18n (content stays English), project/article index pages (the old site
has none: `/project/` and `/article/` are 404 there too), rewriting content.

## Success criteria

- Every URL in the old `wp-sitemap.xml` answers 200 on the new site after cut-over, with the same slug.
- Lighthouse on mobile: Performance ≥ 90, Accessibility ≥ 95, SEO 100 for `/`, one project and one article.
- Every acceptance criterion has a Playwright spec tagged with its story id; `pnpm turbo lint typecheck test`
  and `pnpm --filter web test:e2e` pass in CI.
- Edgar can change any home-page text in Decap and see it live after the merge, without touching code.

## Risks

- Theme-only content (about, experience, project features/links) is not in the REST API: the migrator reads the
  rendered pages; a one-time review of the imported files is part of story 1.2.
- DNS cut-over replaces the live site: done last, after a parity check, with a documented rollback (restore the
  two tunnel CNAMEs).
