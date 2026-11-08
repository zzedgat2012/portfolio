# Architecture: site migration (decisions)

Base architecture and all coding rules: `AGENTS.md` and `docs/conventions.md` (Next.js static export, Decap,
content files, Cloudflare Workers static assets, `apps/decap-auth`). This file records only the decisions the
migration stories share, so stories built in separate sessions stay consistent.

## D1 URLs (parity with WordPress)

| Route | Source | Notes |
| --- | --- | --- |
| `/` | profile + projects + articles | sections anchored `#about`, `#experience`, `#projects`, `#articles`, `#contact` |
| `/project/<slug>/` | `content/projects/<slug>.md` | same slugs as WP |
| `/article/<slug>/` | `content/articles/<slug>.md` | same slugs as WP |
| `/cv/` | profile | A4 print page; PDF at `/edgar-ferreira-cv.pdf` |
| `/feed.xml`, `/sitemap.xml`, `/robots.txt` | generated | `/feed/` and `/wp-sitemap.xml` 301 to them |

`next.config.ts` sets `trailingSlash: true` so the export writes `<route>/index.html` and URLs end in `/` like
WordPress. No project/article index pages; "Back to projects/articles" link to `/#projects` / `/#articles`.

## D2 Content model (one `tags` collection)

| Collection | Kind | File | Key fields |
| --- | --- | --- | --- |
| `projects` | folder, `md` | `content/projects/<slug>.md` | title, summary, coverImage, coverImageAlt, tags (relation, multiple), technologies (string list), features (string list), demoUrl?, codeUrl?, sortOrder, isFeatured, legacyWpId?; body = overview |
| `articles` | folder, `md` | `content/articles/<slug>.md` | title, summary, publishedOn, tags (relation, multiple), coverImage?, coverImageAlt?, legacyWpId?; body = article |
| `tags` | folder, `yml` | `content/tags/<slug>.yml` | name |
| `settings/site` | file | `content/settings/site.yml` | siteName, description?, siteUrl |
| `settings/profile` | file | `content/settings/profile.yml` | name, role, location, heroTitle, heroTagline, portrait, portraitAlt, bio (markdown), technologies[], whatIDo[], education[], certifications[{year,title}], experience[{company,role,startOn YYYY-MM,endOn? YYYY-MM}], experienceSummary, contact{phone,email,website,languages}, links[{label,url,icon,showInHero,showInContact}] |
| `settings/redirects` | file | `content/settings/redirects.yml` | redirects[{from,to,status 301\|302}] |

WordPress post tags and project tags merge into `tags` by slug. Relation integrity is checked by the content
test (story 1.1 extends it to relations).

## D3 Rendering

- Markdown: `react-markdown` + `remark-gfm`; code highlighting at build with `rehype-pretty-code` (Shiki), no raw
  HTML. A fenced block's `title="file.js"` meta is shown as the filename; a small client component copies code.
- Reading time = ceil(words / 200) minutes, computed in the mapper.
- Dates rendered `en-US` long (`December 19, 2025`); experience ranges `Mar 2025 – Present` with duration.
- Icons: `lucide-react` (tree-shaken, server-rendered SVG).
- Carousel: a client component, keyboard and screen-reader accessible, no autoplay.

## D4 Build steps after `next build`

`apps/web/scripts/postbuild.ts` (run by the `build` script after `next build`):
1. writes `out/_redirects` (Cloudflare format) from `content/settings/redirects.yml`;
2. renders `out/cv/index.html` to `out/edgar-ferreira-cv.pdf` (A4) with Playwright Chromium, serving `out/`
   from a throwaway local static server.
CI installs Chromium before building.

## D5 Delivery

GitHub Actions: PR → lint, typecheck, unit, e2e `@smoke`; push to `main` → full e2e then
`wrangler deploy` of `apps/web` (secret `CLOUDFLARE_API_TOKEN`, scoped to Workers on the owning account).
Decap's editorial workflow merges content PRs to `main`, which deploys them.

## D6 Cut-over

Attach `edgar-ferreira.com` and `www.edgar-ferreira.com` as custom domains of `portfolio-web`, after deleting the
two tunnel CNAMEs; `www` → apex via a Cloudflare redirect rule (or a `_redirects` host rule). Remove the
`workers.dev` origin from `ALLOWED_ORIGINS`. Rollback: detach custom domains, recreate the CNAMEs to
`3d951e0e-fd56-45fe-b516-5b66809d014d.cfargotunnel.com` (proxied).
