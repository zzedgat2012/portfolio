import type { Locator, Page, Response } from '@playwright/test';

/** Page object for a project page (`/project/<slug>/`). */
export class ProjectPage {
  readonly heading: Locator;
  readonly backToProjectsLink: Locator;
  readonly tags: Locator;
  readonly demoLink: Locator;
  readonly codeLink: Locator;
  readonly overview: Locator;
  readonly keyFeatures: Locator;
  readonly technologies: Locator;

  constructor(private readonly page: Page) {
    const main = page.getByRole('main');
    this.heading = main.getByRole('heading', { level: 1 });
    this.backToProjectsLink = main.getByRole('link', { name: 'Back to projects' });
    this.tags = main.getByRole('list', { name: 'Tags' });
    this.demoLink = main.getByRole('link', { name: 'View Demo' });
    this.codeLink = main.getByRole('link', { name: 'View Code' });
    this.overview = main.getByRole('region', { name: 'Overview' });
    this.keyFeatures = main.getByRole('region', { name: 'Key Features' });
    this.technologies = main.getByRole('region', { name: 'Technologies Used' });
  }

  /** Visits the project page of `slug` and returns the HTTP response. */
  async openProject(slug: string): Promise<Response | null> {
    return this.page.goto(`/project/${slug}/`);
  }

  coverImage(alt: string): Locator {
    return this.page.getByRole('main').getByRole('img', { name: alt });
  }

  async goBackToProjects(): Promise<void> {
    await this.backToProjectsLink.click();
  }
}
