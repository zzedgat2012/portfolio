# Epics: site migration

Source: [prd-site-migration.md](prd-site-migration.md) · Decisions: [architecture-site-migration.md](architecture-site-migration.md)


## Epic 1: Content and migration

- **1.1 Content model for the whole site**: [1.1-content-model.md](../implementation-artifacts/stories/1.1-content-model.md)
- **1.2 Migrate WordPress content into content files**: [1.2-wordpress-migrator.md](../implementation-artifacts/stories/1.2-wordpress-migrator.md)

## Epic 2: Pages

- **2.1 Site shell: header, footer, layout, 404**: [2.1-site-shell.md](../implementation-artifacts/stories/2.1-site-shell.md)
- **2.2 Home page**: [2.2-home-page.md](../implementation-artifacts/stories/2.2-home-page.md)
- **2.3 Project page**: [2.3-project-page.md](../implementation-artifacts/stories/2.3-project-page.md)
- **2.4 Article page**: [2.4-article-page.md](../implementation-artifacts/stories/2.4-article-page.md)
- **2.5 CV page and PDF**: [2.5-cv-page-pdf.md](../implementation-artifacts/stories/2.5-cv-page-pdf.md)

## Epic 3: SEO and launch

- **3.1 SEO, feeds and redirects**: [3.1-seo-feeds-redirects.md](../implementation-artifacts/stories/3.1-seo-feeds-redirects.md)

## Epic 3: SEO and launch (operations, done by the orchestrator)

- **3.2 CI/CD**: GitHub Actions (PR checks; deploy on `main`), Cloudflare API token as repo secret (D5).
- **3.3 Cut-over**: apex + www to `portfolio-web`, parity check on production, rollback documented (D6).

## Epic 4: Polish

- **4.1 Motion and reading polish** (page transitions, smooth scrolling, custom scrollbar, reading-progress bar): [4.1-motion-and-reading-polish.md](../implementation-artifacts/stories/4.1-motion-and-reading-polish.md)
