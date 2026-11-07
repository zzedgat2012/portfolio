# AGENTS.md

Portfolio site: React (TypeScript) frontend + Strapi 5 headless CMS + PostgreSQL 16, in a pnpm/Turborepo monorepo.
Ported from a WordPress Roots stack (Bedrock, Sage, Trellis). Strapi is the single source of content; the web app only reads it.
Delivery follows the **BMAD Method**. Full rationale and examples: [docs/conventions.md](docs/conventions.md).

## Repository layout

```text
apps/web/            React frontend (SSR/SSG)
apps/cms/            Strapi 5 (TypeScript)
packages/contracts/  domain types, Zod schemas, error classes (shared)
packages/config/     shared tsconfig presets
packages/migrator/   WordPress -> Strapi ETL
_bmad/               BMAD framework install (do not edit core files)
_bmad-output/        BMAD planning artifacts: PRD, architecture, UX, epics, stories
docs/                long-lived human docs (conventions.md, ai/ prompts)
DESIGN.md            visual system (owned by the BMAD UX skill)
design/              OpenPencil mockups (portfolio.fig) and exports/
.kiro/               Kiro steering and MCP config (open-pencil server)
external/            original WordPress theme (Bedrock/Sage), gitignored, read-only, last resort
```

Apps depend on packages, never on each other. `apps/web` talks to Strapi only over HTTP.

## Legacy WordPress reference (`external/`)

`external/` holds the repository of the original WordPress theme. It is **gitignored**, may be missing on a
clone, and is **reference material of last resort**, not a source of truth.

- Consult it only after the story, the BMAD artifacts, `DESIGN.md`, the OpenPencil mockups and the migrated
  Strapi content failed to answer a concrete question (for example: original markup or behavior of a
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
- A decision that changes `architecture-*` or the data model is proposed back to the architecture skill, not made inline in code.
- `DESIGN.md` is produced by the BMAD UX skill (`bmad-ux`). Change it through that skill; never let code diverge from it.
- Each acceptance criterion maps to at least one Playwright test (see Testing). Reference the story id in the `describe` title.
- Customize BMAD through its config/customization files, never by editing files under `_bmad/` core folders.

## Commands

```bash
pnpm install
docker compose up -d postgres          # local DB (always Postgres, never SQLite)
pnpm --filter cms develop              # Strapi admin + API on :1337
pnpm --filter web dev                  # frontend
pnpm biome check --write .             # format + lint + sort imports (Biome, config in biome.jsonc)
pnpm turbo lint typecheck test         # must pass before any commit (lint = biome check)
pnpm --filter cms strapi ts:generate-types   # after ANY schema.json change; commit the output
pnpm --filter web test:e2e             # Playwright
```

## TypeScript rules

- `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`.
- No `any`. Use `unknown` at boundaries and narrow with Zod; derive types with `z.infer`.
- No TS `enum`: use string-literal unions or `as const` objects.
- Named exports only (default export only where the framework requires it: routes, Strapi factories).
- `import type` for type-only imports. Aliases: `@/` inside an app, `@portfolio/<pkg>` across packages.
- Each folder exposes its public API through `index.ts`; never deep-import into another feature.
- Discriminated unions with exhaustive `switch` ending in `assertNever(x)`.
- Errors: throw `AppError` subclasses from `@portfolio/contracts` (`NotFoundError`, `ValidationError`, `CmsUnavailableError`). No catch-log-rethrow.

### Naming

| Symbol | Rule | Example |
| --- | --- | --- |
| Type / interface / class | PascalCase, no `I` prefix | `ProjectCardProps` |
| Function / variable | camelCase | `listProjects` |
| Component | PascalCase, one per file, file `ProjectCard.tsx` | `ProjectCard` |
| Hook | `use` prefix, file kebab-case | `useProjectBySlug` in `use-project-by-slug.ts` |
| Other files | kebab-case | `project-mapper.ts` |
| Constant | UPPER_SNAKE_CASE | `DEFAULT_PAGE_SIZE` |
| Boolean | `is` / `has` / `can` / `should` | `isFeatured` |
| Handlers | `handle…` inside, `on…` as prop | `handleChange` / `onChange` |
| Strapi payload type | `Strapi` prefix | `StrapiProject` |
| Tests | `<source>.test.ts(x)` next to source | `project-mapper.test.ts` |

### Method verbs (the verb is the contract)

| Verb | Returns |
| --- | --- |
| `get…` | `T`, throws `NotFoundError` if missing |
| `find…` | `T \| null` |
| `list…` | `T[]` or `Paginated<T>` |
| `create…` / `update…` / `delete…` | written entity / `void` |
| `to…` / `map…To…` | pure mapping |
| `build…` | pure builder (queries, URLs) |
| `assert…` | `asserts x is T` |
| `is…` / `has…` | `boolean` or type guard |

No `Async` suffix.

## Frontend (`apps/web`)

- Structure: `app/` (routes, providers), `features/<name>/{api,components,hooks,model}`, `blocks/` (dynamic-zone renderers + `registry.tsx`), `shared/{api,ui,lib}`.
- Data path is always: `cms-client` -> query function -> mapper -> hook -> component.
- Components NEVER receive raw Strapi payloads. Mappers validate with Zod and return domain models.
- Use `documentId` / `slug` only; never the numeric `id`.
- TanStack Query keys come from the key factory in `shared/api/query-keys.ts`; no inline key arrays.
- The CMS token is read-only and server-side only (`process.env.CMS_TOKEN`). Never expose it via `VITE_*` / `NEXT_PUBLIC_*`.
- Never send `populate=*`; the CMS sets default populate per route.
- Every new dynamic-zone component needs a block component in `blocks/` and a case in `registry.tsx`.
- Rich text uses Strapi Blocks + `@strapi/blocks-react-renderer`; no `dangerouslySetInnerHTML`.
- Styling: Tailwind. `shared/ui` components contain no data fetching.

## CMS (`apps/cms`)

- Per API: `src/api/<name>/{content-types,controllers,services,routes,policies,middlewares}`.
- Use `factories.createCoreController` / `createCoreService` / `createCoreRouter`.
- Business logic in services; controllers stay thin and always call `sanitizeOutput` (and `sanitizeQuery` / `validateQuery` on input).
- Data access via Document Service (`strapi.documents(uid)`). Do not use the deprecated Entity Service. `strapi.db.query` only for deliberate bulk/reporting work.
- Side effects (cache revalidation, indexing) in Document Service middlewares (`src/index.ts`) or webhooks, not DB lifecycles.
- Config through `env()` in `config/*.ts`; no hard-coded hosts or secrets.
- Uploads: local provider in dev only; S3-compatible provider in production.
- Public role: `find` / `findOne` on published content only.

## Data model rules

- Schema changes ONLY via `schema.json` (committed). Never create or alter Strapi tables by hand.
- `singularName` / `pluralName`: kebab-case English (`case-study` / `case-studies`). `collectionName`: snake_case plural (`case_studies`).
- Attributes camelCase (`shortDescription`); booleans `is…`/`has…`; calendar dates `…On`.
- Reserved, never use as attribute names: `id`, `documentId`, `locale`, `localizations`, `publishedAt`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`.
- Keep identifiers short (Postgres 63-char limit; Strapi derives join/component table names from them).
- Collection type = listable/reusable entity; single type = one-off (`site-setting`, `navigation`); component = owned field group (`shared.seo`, `blocks.hero`); dynamic zone `blocks` = page layout.
- Components: categories `shared`, `blocks`, `layout`; names kebab-case singular; max 2 levels of nesting.
- Anything filtered or sorted on is a real attribute, never inside a dynamic zone.
- Slugs are `uid` fields with `targetField`. Relations are bidirectional (`inversedBy` / `mappedBy`).
- Validation in the schema (`required`, `maxLength`, `unique`, enumerations).
- Draft & Publish on editorial types. Migration bookkeeping (`legacyWpId`) is `private: true`, `unique: true`.
- Indexes and data fixes: Knex migrations in `apps/cms/database/migrations/` named `YYYY.MM.DDTHH.MM.SS.short-description.js`.

## Migration (`packages/migrator`)

- Idempotent: upsert by `legacyWpId`; re-running must never duplicate.
- Load order: media -> taxonomies -> clients -> projects/pages -> navigation/settings.
- Validate every transformed record with Zod before loading.
- Write tokens are for migration only and are revoked after cut-over.

## Testing (TDD, Playwright-first)

Every user-facing change starts with a failing Playwright spec. Units (mappers, hooks, services) follow the same red-green-refactor loop with Vitest.

1. Write the spec that describes the behavior. Run it and confirm it fails **for the right reason** (missing behavior, not a typo or a broken selector).
2. Implement the minimum to make it pass.
3. Refactor with the suite green. Commit spec and code together.

Rules:

- Location: `apps/web/e2e/<feature>/<behavior>.spec.ts`; shared fixtures in `apps/web/e2e/fixtures.ts` via `test.extend`; page objects in `apps/web/e2e/pages/`.
- Names describe behavior from the visitor's view: `test.describe('Project page')`, `test('shows the gallery when the project has images')`.
- Traceability to BMAD: `test.describe('[story 2.3] Project page', …)`, one or more `test` per acceptance criterion. Write these failing specs at the start of `/bmad-build`, before any implementation.
- Locators: `getByRole`, `getByLabel`, `getByText` first; `getByTestId` only as last resort; never CSS or XPath selectors.
- Web-first assertions only (`await expect(locator).toBeVisible()`); never `page.waitForTimeout`.
- E2E runs against a real Strapi + Postgres seeded by `pnpm --filter cms seed:test`. Do not stub the CMS with `page.route`: SSR fetches happen on the server and would not be intercepted.
- Tests are independent: no shared state between tests, no reliance on execution order.
- Page-object methods are named by user intent (`openProject(slug)`, `filterByCategory(name)`), not by DOM actions.
- Tag the critical path with `@smoke`; CI runs `@smoke` on every PR and the full suite on `main`.
- Never commit `test.only` (`forbidOnly` is on in CI) or skipped tests without a linked issue.
- Every new dynamic-zone block gets a spec proving it renders from seeded content.

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
- [ ] Strapi types regenerated and committed if a schema changed
- [ ] Mapper + Zod schema updated for new fields
- [ ] New block has renderer + registry case
- [ ] Migration file for any index or data fix
- [ ] Permissions reviewed for new content types
- [ ] Conventional Commit message referencing the story (`feat(cms): add case-study type (story 2.3)`)
- [ ] Story handed back for status update via the PO agent; deviations from the plan noted in the story

## Never

- Edit generated files in `apps/cms/types/generated/` by hand.
- Add ESLint or Prettier, or silence a Biome rule with `biome-ignore` without a reason after the colon.
- Commit `.env` files or tokens.
- Use SQLite, `any`, TS `enum`, default exports (outside framework entry points), or numeric Strapi `id` in the frontend.
- Change the data model directly in Postgres.
- Edit the `<!-- bmad:context -->` block or BMAD core files under `_bmad/` by hand.
- Implement more than one story per session, or work without a story or explicit task.
- Modify, import from, copy code verbatim from, or bulk-scan `external/`.
