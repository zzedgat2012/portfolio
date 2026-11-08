import type { Locator, Page, Response } from '@playwright/test';

/** Page object for an article page (`/article/<slug>/`). */
export class ArticlePage {
  readonly heading: Locator;
  readonly backToArticlesLink: Locator;
  readonly tags: Locator;
  readonly publishedOn: Locator;
  readonly readingTime: Locator;
  readonly author: Locator;
  readonly body: Locator;
  readonly share: Locator;
  readonly authorCard: Locator;
  /** The only button of the share region; its label turns into "Copied" after a click. */
  readonly copyLinkButton: Locator;

  constructor(private readonly page: Page) {
    const main = page.getByRole('main');
    this.heading = main.getByRole('heading', { level: 1 });
    this.backToArticlesLink = main.getByRole('link', { name: 'Back to articles' });
    this.tags = main.getByRole('list', { name: 'Tags' });
    this.publishedOn = main.getByRole('time');
    this.readingTime = main.getByText(/^\d+ min$/);
    this.author = main.getByRole('region', { name: 'Author', exact: true });
    this.body = main.getByRole('region', { name: 'Article body' });
    this.share = main.getByRole('region', { name: 'Share this article' });
    this.authorCard = main.getByRole('region', { name: /^Written by / });
    this.copyLinkButton = this.share.getByRole('button');
  }

  /** Visits the article page of `slug` and returns the HTTP response. */
  async openArticle(slug: string): Promise<Response | null> {
    return this.page.goto(`/article/${slug}/`);
  }

  /** A highlighted code block; titled blocks are named by their filename. */
  codeBlock(title?: string): Locator {
    return title === undefined
      ? this.body.getByRole('figure')
      : this.body.getByRole('figure', { name: title });
  }

  /** A code block's only button; its label turns into "Copied" after a click. */
  copyCodeButton(codeBlock: Locator): Locator {
    return codeBlock.getByRole('button');
  }

  async copyCode(codeBlock: Locator): Promise<void> {
    await this.copyCodeButton(codeBlock).click();
  }

  async copyArticleLink(): Promise<void> {
    await this.copyLinkButton.click();
  }

  async goBackToArticles(): Promise<void> {
    await this.backToArticlesLink.click();
  }

  /** Fakes the page clock; call before `openArticle`. */
  async installClock(): Promise<void> {
    await this.page.clock.install();
  }

  /**
   * Stops time once the page is ready, so a "Copied" label (reset after 2 s) is asserted
   * deterministically, however slowly the assertion runs.
   */
  async pauseClock(): Promise<void> {
    const now = await this.page.evaluate(() => Date.now());
    // A margin ahead of `now`: the fake clock keeps running until the pause lands.
    await this.page.clock.pauseAt(now + 10_000);
  }

  async advanceClock(milliseconds: number): Promise<void> {
    await this.page.clock.runFor(milliseconds);
  }

  /** The text currently on the system clipboard (needs clipboard permissions). */
  async readClipboard(): Promise<string> {
    return this.page.evaluate(() => navigator.clipboard.readText());
  }
}
