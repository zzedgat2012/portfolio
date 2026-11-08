import type { Locator, Page } from '@playwright/test';

/** Page object for the home route ("/"): hero, featured carousel and the five sections. */
export class HomePage {
  readonly heading: Locator;
  readonly heroLinks: Locator;
  readonly viewProductsLink: Locator;
  readonly carousel: Locator;
  readonly previousSlideButton: Locator;
  readonly nextSlideButton: Locator;
  readonly about: Locator;
  readonly experience: Locator;
  readonly projects: Locator;
  readonly articles: Locator;
  readonly contact: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 });
    this.heroLinks = page.getByRole('list', { name: 'Profile links' });
    this.viewProductsLink = page.getByRole('link', { name: 'View Products' });
    this.carousel = page.getByRole('region', { name: 'Featured projects' });
    this.previousSlideButton = this.carousel.getByRole('button', { name: 'Previous project' });
    this.nextSlideButton = this.carousel.getByRole('button', { name: 'Next project' });
    this.about = page.getByRole('region', { name: 'About', exact: true });
    this.experience = page.getByRole('region', { name: 'Experience', exact: true });
    this.projects = page.getByRole('region', { name: 'Projects', exact: true });
    this.articles = page.getByRole('region', { name: 'Articles', exact: true });
    this.contact = page.getByRole('region', { name: 'Contact', exact: true });
  }

  async open(): Promise<void> {
    await this.page.goto('/');
  }

  /** A carousel slide by its 1-based position ("1 of 2"). */
  slide(position: number, count: number): Locator {
    return this.carousel.getByRole('group', { name: `${position} of ${count}` });
  }

  /** The "Read more" link of the featured project currently reachable in the carousel. */
  featuredProjectLink(title: string): Locator {
    return this.carousel.getByRole('link', { name: `Read more about ${title}` });
  }

  slidePicker(position: number): Locator {
    return this.carousel.getByRole('button', { name: `Show project ${position}` });
  }

  async showNextProject(): Promise<void> {
    await this.nextSlideButton.click();
  }

  async showPreviousProject(): Promise<void> {
    await this.previousSlideButton.click();
  }

  async pickProject(position: number): Promise<void> {
    await this.slidePicker(position).click();
  }

  /** A project card in the `#projects` section, found by its title. */
  projectCard(title: string): Locator {
    return this.projects.getByRole('article').filter({
      has: this.page.getByRole('heading', { name: title }),
    });
  }

  /** An article card in the `#articles` section, found by its title. */
  articleCard(title: string): Locator {
    return this.articles.getByRole('article').filter({
      has: this.page.getByRole('heading', { name: title }),
    });
  }
}
