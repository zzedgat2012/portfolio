import type { Locator, Page, Response } from '@playwright/test';

/** Page object for the printable CV ("/cv/"): the page the build turns into the PDF. */
export class CvPage {
  readonly main: Locator;
  readonly heading: Locator;
  readonly banner: Locator;
  readonly mainNavigation: Locator;
  readonly siteFooter: Locator;

  constructor(private readonly page: Page) {
    this.main = page.getByRole('main');
    this.heading = page.getByRole('heading', { level: 1 });
    this.banner = page.getByRole('banner');
    this.mainNavigation = page.getByRole('navigation', { name: 'Main' });
    this.siteFooter = page.getByRole('contentinfo');
  }

  async open(): Promise<Response | null> {
    return this.page.goto('/cv/');
  }

  /** A CV section (Summary, Skills, …), found by its heading. */
  section(name: string): Locator {
    return this.main.getByRole('region', { name, exact: true });
  }
}
