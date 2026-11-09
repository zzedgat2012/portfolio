---
title: 'Motion and reading polish (story 4.1)'
type: 'feature'
created: '2026-11-09'
status: 'done'
baseline_commit: '356a8ac0811ea3655e4baf84c6677edb7d0b95d0'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/stories/4.1-motion-and-reading-polish.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-4-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Navigation cuts abruptly, anchor jumps are instant, the scrollbar is the browser default and long reads give no sense of progress. DESIGN.md › Movimento (2026-11-09) now specifies all four.

**Approach:** Use only CSS and stable APIs. React 19.3 `<ViewTransition>` handles soft navigations; the installed Next 16.4 docs say it works "with no configuration", so no experimental flag and no architecture decision. Global CSS handles smooth scrolling and the scrollbar. A small client progress bar renders only on the article and project routes.

## Boundaries & Constraints

**Always:** Use the Tailwind `@theme` tokens and the DESIGN.md easing `cubic-bezier(0.16, 1, 0.3, 1)`. All motion is progressive enhancement and is off under `prefers-reduced-motion: reduce`. The progress bar is `aria-hidden`, not focusable, has `pointer-events: none` and is hidden in print. Its scroll listener is `passive` and rAF-throttled. Every AC has a `[story 4.1]` Playwright spec written first and seen failing.

**Never:** No `experimental.*` Next flags, no new dependencies, no `document.startViewTransition` wrappers around the router. No content-model or `config.yml` changes. No progress bar on `/`, `/cv/` or the 404. DESIGN.md is not edited.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Top of page | scrollTop 0 | progress 0 | N/A |
| Bottom | scrollTop = scrollHeight − clientHeight | progress 1 | N/A |
| No scroll | scrollHeight ≤ clientHeight | progress 0 (no division by zero) | N/A |
| Overscroll | scrollTop < 0 or > max | clamped to 0–1 | N/A |
| No View Transitions | browser without the API | normal navigation | none needed |

**Decision (2026-11-09, user): scrollbar hover in Chrome and Safari.** Since Chrome 121, `scrollbar-width`/`scrollbar-color` turn off `::-webkit-scrollbar` styling, so AC 3 and AC 6 conflict in Chromium. Resolution: the standard properties (`scrollbar-width: thin`, `scrollbar-color: border background`) live inside `@supports not selector(::-webkit-scrollbar)` and apply only in Firefox. Every other browser uses `::-webkit-scrollbar*` rules: thin (8px), track `background`, thumb `border` with `full` radius, thumb `muted-foreground` on hover. Firefox has no hover change. AC 6 is amended: in Chromium the test asserts the webkit scrollbar rules exist (thumb hover rule present; the root does not set the standard properties), not a computed `scrollbar-width: thin`. Record this deviation in the story's Dev notes.

</frozen-after-approval>

## Code Map

- `apps/web/src/app/globals.css` -- `@theme` tokens (`--color-background`, `--color-border`, `--color-muted-foreground`, `--color-accent`, `--color-primary`). Add the scroll, scrollbar, view-transition and reduced-motion rules here. Do not touch the `[data-theme="print"]` block.
- `apps/web/src/app/layout.tsx` -- root `<html>`. Add `data-scroll-behavior="smooth"`, so Next 16 turns smooth scrolling off during route changes (new pages open at the top instantly, per the Next 16 upgrade guide).
- `apps/web/src/app/(site)/layout.tsx` -- shell: SkipLink, `SiteHeader`, `<main>{children}</main>`, footer. Wrap `{children}` here in React `<ViewTransition>`. `/cv/` and the 404 are outside `(site)`.
- `apps/web/src/features/site-shell/components/SiteHeader.tsx` -- `<header className="relative">`. Give it `view-transition-name: site-header` so it stays put.
- `apps/web/src/app/(site)/article/[slug]/page.tsx`, `apps/web/src/app/(site)/project/[slug]/page.tsx` -- detail routes. Render `<ReadingProgress />` next to `JsonLd`.
- `apps/web/src/shared/ui/CopyButton.tsx` -- pattern for a small `'use client'` primitive (named export, file-level doc comment). `shared/ui/index.ts` is the barrel.
- `apps/web/e2e/fixtures.ts`, `e2e/pages/{site-shell,article-page,project-page,home-page,cv-page}.ts` -- page objects to extend. `homePage.projectCard(title)` finds a project card for the navigation test.
- Fixtures: `seed-article-with-markdown` (42 lines) and `seed-featured-project`. They may not scroll on a 1280×720 viewport, so set a small viewport in the progress spec (for example 390×640) rather than adding fixture content.
- Reference: `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md` (header anchoring, `::view-transition { pointer-events: none }`, reduced-motion block).

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/e2e/shell/motion.spec.ts` -- FIRST: write the failing specs. `html` scroll-behavior is `smooth`, and `auto` under `test.use({ reducedMotion: 'reduce' })`. In Chromium, `::-webkit-scrollbar` and `::-webkit-scrollbar-thumb:hover` rules exist in `document.styleSheets`, and the root `scrollbar-width` is not `thin` (see the scrollbar Decision). The header's `view-transition-name` is `site-header`, and a `::view-transition-new` rule exists in `document.styleSheets`. Clicking a project card on home lands on the project page heading.
- [x] `apps/web/e2e/article/reading-progress.spec.ts`, `apps/web/e2e/project/reading-progress.spec.ts` -- FIRST: the bar exists and has `aria-hidden="true"`. Its width grows after scrolling to the bottom. It is absent on home and on `/cv/`. Locate it with `getByTestId('reading-progress')`, because aria-hidden elements have no role; note this exception in the spec.
- [x] `apps/web/src/shared/lib/scroll-progress.ts` (+ `.test.ts`) -- pure `toScrollProgress(scrollTop, scrollHeight, clientHeight)` returning 0–1 per the matrix. Export it from `shared/lib/index.ts`.
- [x] `apps/web/src/shared/ui/ReadingProgress.tsx` -- `'use client'`: fixed `top-0 inset-x-0 h-0.5`, `z` above content, `pointer-events-none`, `print:hidden`, `bg-linear-to-r from-accent to-primary`. `transform: scaleX(p)` with `origin-left`, and a short transform transition that is removed under `motion-reduce`. Passive scroll/resize listeners, rAF-throttled. Export it from the barrel.
- [x] Detail route pages -- render `<ReadingProgress />`.
- [x] `globals.css`, `layout.tsx`, `(site)/layout.tsx`, `SiteHeader.tsx` -- smooth scroll, scrollbar, `<ViewTransition default="page">`, `::view-transition-old(.page)` fade-out and `::view-transition-new(.page)` fade-in from `translateY(8px)` over 300ms. Header group with `animation: none`. `::view-transition { pointer-events: none }`. A reduced-motion block sets the view-transition animations to none and `scroll-behavior: auto`.

**Acceptance Criteria:**
- Given any `(site)` page, when the visitor follows an internal link, then the content fades out and rises in over about 300ms while the header stays still, and the destination page renders.
- Given an anchor link such as `/#projects`, when it is clicked on home, then the page scrolls smoothly; under reduced motion it jumps.
- Given an article or project page, when the visitor scrolls, then a 2px accent→primary bar at the top grows to full width at the bottom, never blocks header clicks, and is absent on home, CV, the 404 and in print.
- Given `prefers-reduced-motion: reduce`, then there is no page transition, `scroll-behavior` is `auto`, and the bar updates without animating.

## Implementation Notes

## Spec Change Log

## Review Triage Log

| # | Source | Finding | Verdict | Evidence | Route |
|---|--------|---------|---------|----------|-------|
| 1 | verification-gap, blind | No test proves the page transition runs or is suppressed under reduced motion | medium | Pre-verified: CSSOM and URL checks stay green with `<ViewTransition>` removed | patch |
| 2 | blind | `ViewTransition` needs `experimental.viewTransition` | false | Installed `next/dist/docs/.../view-transitions.md:50`: "work in the App Router with no configuration"; implementation probe saw `page-rise-in` run | reject |
| 3 | blind | Scrollbar test name overclaims (rules exist, not rendering) | low | Test only checks selectors; rename is a direct correction | patch |
| 4 | blind, edge | "never intercepts clicks on the header" clicks below the 2px bar | low | `homeLink` center is ~40px down; the click cannot hit the bar | patch |
| 5 | blind, edge | Bar goes stale when document height changes without scroll | low | Real, but corrects on the next scroll event; ResizeObserver adds surface | reject |
| 6 | blind, edge | Bar is inside the `.page` boundary and rises/fades during navigation, under the header group | low | React names top-level host children of the boundary; 300ms cosmetic on a 2px bar | reject |
| 7 | blind, edge | No test follows a real anchor or checks route-change scroll reset | low | AC 6 asks for computed `scroll-behavior`; Next owns the reset via `data-scroll-behavior` | reject |
| 8 | blind | Non-scrolling page shows 0 | false | Story AC 4 specifies "0% when the page does not scroll" | reject |
| 9 | edge | Fractional `scrollTop` at bottom leaves bar short of full width | low | Sub-pixel scale (≥0.998); invisible on a 2px bar | reject |
| 10 | edge | Cross-origin stylesheet makes `styleRuleSelectors` throw | false | Static export serves only same-origin CSS; no external sheets | reject |
| 11 | blind | Duplicated article/project specs; "elsewhere" block lives in project spec | low | Maintainability only, no named divergence | reject |
| 12 | blind | Effect nits: redundant `bar?.`, sync initial update, 150ms lag, no cleanup test | low | Cosmetic; behavior verified by e2e | reject |
| 13 | blind | `homePage.openProject(title)` vs `projectPage.openProject(slug)` | low | Different page objects, each named by intent | reject |
| 14 | blind | `.github/workflows/ci.yml` reformatted outside the diff | false | Not in the story diff; excluded from the story commit, surfaced to the user | reject |

## Design Notes

Width is set with `scaleX` rather than `width`, so updates stay on the compositor. The bar's bounding-box width still reflects the progress, which is what the spec asserts. The story's "experimental flag" question is resolved by the installed stack: React 19.3 `ViewTransition` is stable and Next 16.4 needs no config. Record this in the story's Dev notes.

## Verification

**Commands:**
- `pnpm biome check --write .` -- expected: clean
- `pnpm turbo lint typecheck test` -- expected: all green, including `scroll-progress.test.ts`
- `pnpm --filter web test:e2e` -- expected: all green, new `[story 4.1]` specs included
