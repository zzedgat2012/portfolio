import { test as base } from '@playwright/test';
import { ArticlePage } from './pages/article-page';
import { HomePage } from './pages/home-page';
import { NotFoundPage } from './pages/not-found-page';
import { ProjectPage } from './pages/project-page';
import { SiteShell } from './pages/site-shell';

type Fixtures = {
  articlePage: ArticlePage;
  homePage: HomePage;
  notFoundPage: NotFoundPage;
  projectPage: ProjectPage;
  siteShell: SiteShell;
};

export const test = base.extend<Fixtures>({
  articlePage: async ({ page }, use) => {
    await use(new ArticlePage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  notFoundPage: async ({ page }, use) => {
    await use(new NotFoundPage(page));
  },
  projectPage: async ({ page }, use) => {
    await use(new ProjectPage(page));
  },
  siteShell: async ({ page }, use) => {
    await use(new SiteShell(page));
  },
});

export { expect } from '@playwright/test';
