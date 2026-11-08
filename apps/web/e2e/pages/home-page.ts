import type { Locator, Page } from '@playwright/test';

/** Page object for the home route ("/"). */
export class HomePage {
  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 });
  }

  async open(): Promise<void> {
    await this.page.goto('/');
  }
}
