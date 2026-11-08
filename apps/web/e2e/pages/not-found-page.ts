import type { Locator, Page, Response } from '@playwright/test';

/** Page object for the not-found page Cloudflare serves for unknown URLs. */
export class NotFoundPage {
  readonly heading: Locator;
  readonly message: Locator;
  readonly attemptedPath: Locator;
  readonly backHomeLink: Locator;
  readonly goBackButton: Locator;
  readonly suggestions: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1, name: '404' });
    this.message = page.getByText("The page you're looking for doesn't exist.");
    this.attemptedPath = page.getByText('Attempted path:');
    this.backHomeLink = page.getByRole('link', { name: 'Back to Home' });
    this.goBackButton = page.getByRole('button', { name: 'Go Back' });
    this.suggestions = page.getByRole('navigation', { name: 'Suggested pages' });
  }

  /** Visits a URL that does not exist and returns the HTTP response. */
  async openMissing(path: string): Promise<Response | null> {
    return this.page.goto(path);
  }

  async goHome(): Promise<void> {
    await this.backHomeLink.click();
  }
}
