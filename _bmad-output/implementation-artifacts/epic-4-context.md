# Epic 4 Context: Polish

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Make the finished, launched static portfolio feel smooth and polished without changing content, URLs or the content model. Epics 1–3 shipped the content, pages, SEO and cut-over. This epic adds motion and reading aids from the updated DESIGN.md motion spec: page transitions, smooth anchor scrolling, a custom scrollbar, and a reading-progress bar on long reads. Visitors (mostly mobile, from search and LinkedIn) get a site that feels finished and lets them pace their reading. Accessibility and performance must not drop. There is no PRD section for this epic. Requirements come from the DESIGN.md motion update and its UX decision log.

## Stories

- Story 4.1: Motion and reading polish

## Requirements & Constraints

- All motion is progressive enhancement. A browser without support (for example, without View Transitions) behaves normally, with no fallback and no errors.
- Everything animated is off under `prefers-reduced-motion: reduce`: no page transition and `scroll-behavior: auto`. A position indicator may still update, but it must not animate.
- Decorative elements (the progress bar) are `aria-hidden`, not focusable, never cover or intercept clicks on interactive UI, and are hidden in print. Reading time is already shown as text, so the bar adds nothing for assistive technology.
- Do not regress the Lighthouse mobile targets for `/`, one project and one article: Performance ≥ 90, Accessibility ≥ 95, SEO 100. Keep client JavaScript minimal. Scroll listeners are `passive` and throttled with rAF.
- Detail-page-only features must not appear on the home, CV (`/cv/`, which is also rendered to PDF) or 404 pages.
- Every acceptance criterion maps to a Playwright spec tagged `[story 4.x]`, run against fixture content (`seed-…` slugs). Assert behavior and computed styles, not visual motion.

## Technical Decisions

- The stack is unchanged: Next.js App Router static export (`output: 'export'`, `trailingSlash: true`) served as Cloudflare Workers static assets. There is no runtime server, middleware or client-side data fetching.
- Routes involved: `/` (sections anchored `#about`, `#experience`, `#projects`, `#articles`, `#contact`), `/project/<slug>/`, `/article/<slug>/`, `/cv/`. "Back to projects/articles" links point to `/#projects` and `/#articles`.
- Interactive pieces are small client components in `shared/ui` or `features/site-shell` that read no data. Detail pages render them. Use the Tailwind `@theme` tokens only, never hard-coded colors or values.
- Open decision: `<Link>` does soft client-side navigation, so CSS cross-document `@view-transition` alone will not animate it. The options are Next's `experimental.viewTransition` with React `<ViewTransition>`, or `document.startViewTransition` around router navigation. Turning on an experimental framework flag is an architecture decision. Propose it to `bmad-architecture` as a new D-series entry rather than enabling it inline, and record the outcome in the story.
- No content-model, `config.yml` or Zod changes are expected in this epic.

## UX & Interaction Patterns

- Standard easing: `cubic-bezier(0.16, 1, 0.3, 1)`. Existing motion (section entrances, 150ms hover color changes, 1.05 card scale) stays as it is.
- Page transition: the old page fades out, and the new page fades in while rising from `translateY(8px)`, over about 300ms. The header stays static.
- Smooth scrolling: `scroll-behavior: smooth` on `html` for anchor links.
- Scrollbar (new, no legacy equivalent): thin, track in `background`, thumb in `border` with `full` radius, thumb in `muted-foreground` on hover. Use `scrollbar-width`/`scrollbar-color`, plus `::-webkit-scrollbar` where needed.
- Reading-progress bar (article and project pages only): 2px, fixed to the top of the viewport (the header is not sticky), gradient from `accent` to `primary`. Width = `scrollTop / (scrollHeight - clientHeight)`, clamped 0–1. It shows 0% when the page does not scroll.
- There is no mockup for these refinements; they are spine-only by design. DESIGN.md's motion section is the visual source of truth. Change it through `bmad-ux`, never diverge from it in code.

## Cross-Story Dependencies

- Builds on the site shell (story 2.1: header, layout, non-sticky header), the project page (2.3), the article page (2.4) and the CV page (2.5, whose print/PDF output must stay free of the progress bar).
- The page-transition approach depends on an architecture decision (see Technical Decisions) that must be settled before that part is coded.
