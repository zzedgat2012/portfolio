import type { Locator, Page } from '@playwright/test';

/** Page object for the header, skip link and footer shared by every site page. */
export class SiteShell {
  readonly banner: Locator;
  readonly mainNavigation: Locator;
  readonly main: Locator;
  readonly footer: Locator;
  readonly homeLink: Locator;
  readonly skipLink: Locator;
  readonly menuButton: Locator;
  /**
   * The decorative reading-progress bar of article and project pages. It is `aria-hidden`, so it
   * has no role or accessible name: a test id is the only way to locate it.
   */
  readonly readingProgress: Locator;

  constructor(private readonly page: Page) {
    this.banner = page.getByRole('banner');
    this.mainNavigation = page.getByRole('navigation', { name: 'Main' });
    this.main = page.getByRole('main');
    this.footer = page.getByRole('contentinfo');
    this.homeLink = this.banner.getByRole('link', { name: 'Edgar Ferreira' });
    this.skipLink = page.getByRole('link', { name: 'Skip to content' });
    this.menuButton = this.banner.getByRole('button', { name: 'Menu' });
    this.readingProgress = page.getByTestId('reading-progress');
  }

  async open(path = '/'): Promise<void> {
    await this.page.goto(path);
  }

  navLink(name: string): Locator {
    return this.mainNavigation.getByRole('link', { name, exact: true });
  }

  async goToSection(name: string): Promise<void> {
    await this.navLink(name).click();
  }

  async openMobileMenu(): Promise<void> {
    await this.menuButton.click();
  }

  async skipToContent(): Promise<void> {
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Enter');
  }

  /** Scrolls to the end of the document, as a reader finishing the page. */
  async readToTheEnd(): Promise<void> {
    await this.page.evaluate(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }),
    );
  }

  /** Rendered width of the reading-progress bar in CSS pixels (0 when it has no box). */
  async readingProgressWidth(): Promise<number> {
    return (await this.readingProgress.boundingBox())?.width ?? 0;
  }

  /**
   * Selectors of every style rule in the page's stylesheets, nested `@media`/`@supports` rules
   * included. Pseudo-elements such as `::-webkit-scrollbar` or `::view-transition-new()` have no
   * locator, so their presence is read from the CSSOM. With `mediaCondition`, only rules inside an
   * `@media` whose condition contains it (for example `prefers-reduced-motion: reduce`).
   */
  async styleRuleSelectors(mediaCondition?: string): Promise<string[]> {
    return this.page.evaluate((condition) => {
      const selectors: string[] = [];
      const visit = (rules: CSSRuleList, isInMedia: boolean) => {
        for (const rule of Array.from(rules)) {
          if (rule instanceof CSSStyleRule && (condition === undefined || isInMedia)) {
            selectors.push(rule.selectorText);
          }
          if (rule instanceof CSSMediaRule) {
            const matches = condition !== undefined && rule.conditionText.includes(condition);
            visit(rule.cssRules, isInMedia || matches);
          } else if ('cssRules' in rule && rule.cssRules instanceof CSSRuleList) {
            visit(rule.cssRules, isInMedia);
          }
        }
      };
      for (const sheet of Array.from(document.styleSheets)) {
        visit(sheet.cssRules, false);
      }
      return selectors;
    }, mediaCondition);
  }

  /**
   * Starts recording the view-transition animations the browser runs, as
   * `"<pseudo-element> <animation name> <duration ms>"`. Call before opening the page. The
   * animations last ~300ms, so every frame is sampled instead of polling from the test.
   */
  async recordPageTransitions(): Promise<void> {
    await this.page.addInitScript(() => {
      const seen = new Set<string>();
      const recorded: string[] = [];
      (window as unknown as { pageTransitions: string[] }).pageTransitions = recorded;
      const sample = () => {
        for (const animation of document.getAnimations()) {
          const effect = animation.effect;
          if (
            !(effect instanceof KeyframeEffect) ||
            !effect.pseudoElement?.startsWith('::view-transition')
          ) {
            continue;
          }
          const name = animation instanceof CSSAnimation ? animation.animationName : '';
          const entry = `${effect.pseudoElement} ${name} ${Number(effect.getTiming().duration) || 0}`;
          if (!seen.has(entry)) {
            seen.add(entry);
            recorded.push(entry);
          }
        }
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
  }

  /** View-transition animations recorded since `recordPageTransitions()`. */
  async recordedPageTransitions(): Promise<string[]> {
    return this.page.evaluate(
      () => (window as unknown as { pageTransitions?: string[] }).pageTransitions ?? [],
    );
  }
}
