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

  constructor(private readonly page: Page) {
    this.banner = page.getByRole('banner');
    this.mainNavigation = page.getByRole('navigation', { name: 'Main' });
    this.main = page.getByRole('main');
    this.footer = page.getByRole('contentinfo');
    this.homeLink = this.banner.getByRole('link', { name: 'Edgar Ferreira' });
    this.skipLink = page.getByRole('link', { name: 'Skip to content' });
    this.menuButton = this.banner.getByRole('button', { name: 'Menu' });
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
}
