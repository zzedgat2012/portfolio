# AGENTS.md

Portfolio site: Next.js (App Router, TypeScript) frontend + Decap CMS (git-based) in a pnpm/Turborepo monorepo,
hosted on Cloudflare (Workers static assets) from the GitHub repo `zzedgat2012/portfolio`.
Ported from a WordPress Roots stack (Bedrock, Sage, Trellis). Content is Markdown/YAML files in `content/`, edited
through Decap and committed to git; the web app only reads those files at build time. There is no database.
Delivery follows the **BMAD Method**. Full rationale and examples: [docs/conventions.md](docs/conventions.md).

## Repository layout

```text
apps/web/                   Next.js frontend (App Router, static export to out/, deployed as Workers static assets)
apps/decap-auth/            Cloudflare Worker: GitHub OAuth proxy for the Decap login
apps/web/public/admin/      Decap CMS admin: index.html + config.yml (the content model)
apps/web/public/uploads/    media managed by Decap (committed)
content/                    all site content: Markdown + YAML, one file per entry
packages/contracts/         domain types, Zod schemas for content files, error classes (shared)
packages/config/            shared tsconfig presets
packages/migrator/          WordPress -> content files ETL
_bmad/                      BMAD framework install (do not edit core files)
_bmad-output/               BMAD planning artifacts: PRD, architecture, UX, epics, stories
docs/                       long-lived human docs (conventions.md, ai/ prompts)
DESIGN.md                   visual system (owned by the BMAD UX skill)
design/                     OpenPencil mockups (portfolio.fig) and exports/
.claude/                    Claude Code rules, skills, settings; .mcp.json holds the open-pencil server
external/                   original WordPress theme (Bedrock/Sage), gitignored, read-only, last resort
```

Apps depend on packages, never on each other. `content/` is data: the migrator writes it, Decap edits it,
`apps/web` reads it. Nothing reads content over HTTP.

## Legacy WordPress reference (`external/`)

`external/` holds the repository of the original WordPress theme. It is **gitignored**, may be missing on a
clone, and is **reference material of last resort**, not a source of truth.

- Consult it only after the story, the BMAD artifacts, `DESIGN.md`, the OpenPencil mockups and the migrated
  content in `content/` failed to answer a concrete question (for example: original markup or behavior of a
  section, an ACF field name or layout, a permalink pattern, a Blade partial to port).
- Open the specific file you need; never scan, index or search the whole folder.
- Read-only: never modify it, never import from it, never copy PHP/Blade/JS verbatim. Re-express what you
  learn with the conventions in this file.
- If it contradicts a BMAD artifact, `DESIGN.md` or a mockup, those win; report the difference instead of
  reproducing the old behavior.
- When you used it, name the files you read in your report, so the gap can be fixed in the BMAD artifacts.

## Workflow (BMAD)

- Work is driven by BMAD artifacts in `_bmad-output/`. Before implementing, read the story (or plan) you were given and the relevant `prd-*`, `architecture-*` and `ux-*` documents. Do not start code without a story or an explicit task.
- **Story = WHAT, this file = HOW.** Acceptance criteria decide behavior; AGENTS.md decides naming, structure and tests. If they conflict, stop and flag it instead of choosing silently.
- Implementation runs through `/bmad-build`, **one unit (story) per session**. Start a fresh session for the next unit.
- Requirements, stories and ticket status go through the PO agent (`bmad-agent-po`); planning docs through the PM agent (`bmad-agent-pm`); technical decisions through `bmad-architecture`. Do not invent requirements or mark stories done yourself.
- A decision that changes `architecture-*` or the content model is proposed back to the architecture skill, not made inline in code.
- `DESIGN.md` is produced by the BMAD UX skill (`bmad-ux`). Change it through that skill; never let code diverge from it.
- Each acceptance criterion maps to at least one Playwright test (see Testing). Reference the story id in the `describe` title.
- Customize BMAD through its config/customization files, never by editing files under `_bmad/` core folders.

## Commands

```bash
pnpm install
pnpm --filter web dev                  # Next.js on :3000, admin at http://localhost:3000/admin/index.html
pnpm cms:local                         # decap-server on :8081 so the admin writes to local files (no login)
pnpm biome check --write .             # format + lint + sort imports (Biome, config in biome.jsonc)
pnpm turbo lint typecheck test         # must pass before any commit (lint = biome check); includes content validation
pnpm --filter web build                # static export to apps/web/out; fails on any invalid content file
pnpm --filter web deploy               # wrangler deploy of apps/web/out (CI on merge to main)
pnpm --filter decap-auth deploy        # wrangler deploy of the OAuth proxy
pnpm --filter <app> exec wrangler <cmd>   # Wrangler for one app (web | decap-auth); never `pnpm add -w wrangler`
pnpm -w auth:secret                    # set GITHUB_CLIENT_SECRET on portfolio-decap-auth, from any folder
pnpm --filter web test:e2e             # Playwright, against a production build of the e2e content fixtures
```

## TypeScript rules

- `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`.
- No `any`. Use `unknown` at boundaries and narrow with Zod; derive types with `z.infer`.
- No TS `enum`: use string-literal unions or `as const` objects.
- Named exports only (default export only where the framework requires it: Next.js `page.tsx`, `layout.tsx`, `not-found.tsx`, `next.config.ts`, etc.).
- `import type` for type-only imports. Aliases: `@/` inside an app, `@portfolio/<pkg>` across packages.
- Each folder exposes its public API through `index.ts`; never deep-import into another feature.
- Discriminated unions with exhaustive `switch` ending in `assertNever(x)`.
- Errors: throw `AppError` subclasses from `@portfolio/contracts` (`NotFoundError`, `ValidationError`). No catch-log-rethrow.

### Naming

| Symbol | Rule | Example |
| --- | --- | --- |
| Type / interface / class | PascalCase, no `I` prefix | `ProjectCardProps` |
| Function / variable | camelCase | `listProjects` |
| Component | PascalCase, one per file, file `ProjectCard.tsx` | `ProjectCard` |
| Next.js route files | framework names, lowercase | `app/projects/[slug]/page.tsx` |
| Hook | `use` prefix, file kebab-case | `useGalleryLightbox` in `use-gallery-lightbox.ts` |
| Other files | kebab-case | `project-mapper.ts` |
| Constant | UPPER_SNAKE_CASE | `DEFAULT_PAGE_SIZE` |
| Boolean | `is` / `has` / `can` / `should` | `isFeatured` |
| Handlers | `handle…` inside, `on…` as prop | `handleChange` / `onChange` |
| Content file schema / type | `…FileSchema` / `…File` | `projectFileSchema`, `ProjectFile` |
| Tests | `<source>.test.ts(x)` next to source | `project-mapper.test.ts` |

### Method verbs (the verb is the contract)

| Verb | Returns |
| --- | --- |
| `get…` | `T`, throws `NotFoundError` if missing |
| `find…` | `T \| null` |
| `list…` | `T[]` or `Paginated<T>` |
| `create…` / `update…` / `delete…` | written entity / `void` (migrator only) |
| `to…` / `map…To…` | pure mapping |
| `build…` | pure builder (paths, URLs, metadata) |
| `assert…` | `asserts x is T` |
| `is…` / `has…` | `boolean` or type guard |

No `Async` suffix.

## Frontend (`apps/web`)

- Next.js App Router with `output: 'export'`: content routes export `generateStaticParams` and `dynamicParams = false`. Data is read in Server Components; there is no client-side data fetching, no API routes, no middleware and no runtime server.
- Redirects are generated into `out/_redirects` (Cloudflare format) from `content/settings/redirects.yml`; `next.config.ts` `redirects()` does not work with static export.
- Structure (`apps/web/src`): `app/` (routes, layouts), `features/<name>/{content,components,hooks,model}`, `blocks/` (page-section renderers + `registry.tsx`), `shared/{content,ui,lib}`.
- Data path is always: `content-source` (server-only file reader) -> query function -> mapper -> Server Component.
- Components NEVER receive raw file data. Every file is parsed with its Zod schema from `@portfolio/contracts`; mappers turn it into domain models. An invalid file throws `ValidationError` (with the file path) and fails the build.
- Entries are identified by `slug` (the file name). Relations between entries store the target slug.
- The content directory comes from `CONTENT_DIR` (default: repo-root `content/`); never hard-code another path.
- No secrets in the web app. Never put a token in `NEXT_PUBLIC_*`, `config.yml` or `public/`.
- Every new section type needs a type in `config.yml`, a Zod variant, a block component in `blocks/`, and a case in `registry.tsx`.
- Rich text is Markdown, rendered with `react-markdown` (no raw-HTML plugin); no `dangerouslySetInnerHTML`.
- Images use `next/image` (`images.unoptimized: true` under static export) with paths under `/uploads`. Styling: Tailwind. `shared/ui` components contain no data reading.

## CMS (Decap)

- The admin is a static page: `apps/web/public/admin/index.html` loads Decap from a pinned exact version; `config.yml` next to it defines collections and fields.
- Backend: `github` (`repo: zzedgat2012/portfolio`) in production, through the `apps/decap-auth` Worker (`base_url` in `config.yml`); `local_backend: true` in development, served by `pnpm cms:local`.
- `apps/decap-auth` holds the GitHub OAuth client secret as a Worker secret (`wrangler secret put`), checks `state`, and only posts the token to allow-listed origins.
- `publish_mode: editorial_workflow`: editors' drafts are branches/PRs; `main` only holds published content, and each merge triggers a deploy.
- Media: `media_folder: apps/web/public/uploads`, `public_folder: /uploads`. Keep images web-sized; no other upload provider.
- `config.yml` and the Zod schemas in `packages/contracts` describe the same model and change in the same commit. A Vitest test checks they agree and that every file in `content/` parses.
- Editor access = write access to the GitHub repository. Review collaborators when adding editors; never widen the OAuth app scope beyond `repo`.

## Content model rules

- The model lives ONLY in `config.yml` + the Zod schemas. Never add files or fields to `content/` that Decap does not know about.
- Layout: `content/<collection>/<slug>.md` for editorial entries (YAML frontmatter + Markdown body); `content/<collection>/<slug>.yml` for data-only entries; `content/settings/<name>.yml` for one-off file collections.
- Collection names: kebab-case English plural (`projects`, `case-studies`); folder name = collection name.
- Fields camelCase (`shortDescription`); booleans `is…`/`has…`; calendar dates `…On` (`YYYY-MM-DD`).
- Folder collection = listable/reusable entity (`projects`, `pages`, `categories`); file collection = one-off (`settings/site`, `settings/navigation`); object widget = owned field group (`seo`); list widget with `types` (`typeKey: type`) = page sections (`sections`).
- Section types: kebab-case singular (`hero`, `rich-text`, `gallery`); max 2 levels of nested object/list widgets.
- Slugs: file name from `slug: "{{slug}}"` on the title; do not change a published slug without adding a redirect.
- Relations use the `relation` widget storing the target's slug; the content test checks every relation resolves.
- Validation in both places: `required`, `pattern`, `min`/`max` in `config.yml` (editor UX) and the same rules in Zod (the authority).
- Migration bookkeeping (`legacyWpId`) is a `hidden` widget, unique across its collection, and never mapped into the domain model.

## Migration (`packages/migrator`)

- Writes files into `content/` and media into `apps/web/public/uploads/`; never commits by itself. Review the diff, then commit.
- Idempotent: match existing files by `legacyWpId`; re-running must overwrite in place, never duplicate.
- Order: media -> taxonomies -> clients -> projects/pages -> navigation/settings -> redirect map (`content/settings/redirects.yml`).
- HTML becomes Markdown; ACF layouts become `sections` items. Validate every record with the contracts Zod schema before writing.
- Bulk content fixes are idempotent scripts in `packages/migrator`, committed with the content they change.

## Testing (TDD, Playwright-first)

Every user-facing change starts with a failing Playwright spec. Units (mappers, schemas, content source) follow the same red-green-refactor loop with Vitest.

1. Write the spec that describes the behavior. Run it and confirm it fails **for the right reason** (missing behavior, not a typo or a broken selector).
2. Implement the minimum to make it pass.
3. Refactor with the suite green. Commit spec and code together.

Rules:

- Location: `apps/web/e2e/<feature>/<behavior>.spec.ts`; shared fixtures in `apps/web/e2e/fixtures.ts` via `test.extend`; page objects in `apps/web/e2e/pages/`.
- Names describe behavior from the visitor's view: `test.describe('Project page')`, `test('shows the gallery when the project has images')`.
- Traceability to BMAD: `test.describe('[story 2.3] Project page', …)`, one or more `test` per acceptance criterion. Write these failing specs at the start of `/bmad-build`, before any implementation.
- Locators: `getByRole`, `getByLabel`, `getByText` first; `getByTestId` only as last resort; never CSS or XPath selectors.
- Web-first assertions only (`await expect(locator).toBeVisible()`); never `page.waitForTimeout`.
- E2E runs against the static export (`next build`, served by `wrangler dev`, as in production) with `CONTENT_DIR=e2e/content`: committed fixture content with `seed-…` slugs. Never depend on real editorial content in `content/`. Do not stub with `page.route`: pages are rendered at build time on the server.
- Tests are independent: no shared state between tests, no reliance on execution order.
- Page-object methods are named by user intent (`openProject(slug)`, `filterByCategory(name)`), not by DOM actions.
- Tag the critical path with `@smoke`; CI runs `@smoke` on every PR and the full suite on `main`.
- Never commit `test.only` (`forbidOnly` is on in CI) or skipped tests without a linked issue.
- Every new section type gets fixture content and a spec proving it renders.

Commands:

```bash
pnpm --filter web test:e2e              # full suite, headless
pnpm --filter web test:e2e --ui         # UI mode for the red/green loop
pnpm --filter web test:e2e --grep @smoke
pnpm --filter web exec playwright codegen http://localhost:3000   # locator discovery only; rewrite output to these rules
```

## Definition of done

- [ ] Every acceptance criterion of the story is covered by a test tagged with the story id
- [ ] A Playwright spec (or Vitest test for units) was written first and failed before the change
- [ ] `pnpm turbo lint typecheck test` and `pnpm --filter web test:e2e` pass
- [ ] `config.yml`, Zod schema, mapper and e2e fixture content updated together for any model change
- [ ] New section type has a Decap type, renderer + registry case, fixture and spec
- [ ] Existing `content/` files migrated (script in `packages/migrator`) when a field is renamed or made required
- [ ] Redirect added for any changed slug or route
- [ ] Conventional Commit message referencing the story (`feat(web): add case-study collection (story 2.3)`)
- [ ] Story handed back for status update via the PO agent; deviations from the plan noted in the story

## Never

- Add ESLint or Prettier, or silence a Biome rule with `biome-ignore` without a reason after the colon.
- Commit `.env` files or tokens, or put secrets in `config.yml`, `public/` or `NEXT_PUBLIC_*` variables.
- Use `any`, TS `enum`, or default exports (outside framework entry points).
- Add a database, a headless CMS API, or client-side fetching of content.
- Change `content/` structure without changing `config.yml` and the Zod schemas in the same commit.
- Render Markdown as raw HTML (`rehype-raw`, `dangerouslySetInnerHTML`).
- Edit the `<!-- bmad:context -->` block or BMAD core files under `_bmad/` by hand.
- Implement more than one story per session, or work without a story or explicit task.
- Modify, import from, copy code verbatim from, or bulk-scan `external/`.
