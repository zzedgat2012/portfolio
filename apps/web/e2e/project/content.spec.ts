import { expect, test } from '../fixtures';

test.describe('[story 2.3] Project page content', () => {
  test('shows the title, tags, cover, overview, key features and technologies @smoke', async ({
    projectPage,
  }) => {
    await projectPage.openProject('seed-featured-project');

    await expect(projectPage.heading).toHaveText('Seed featured project');
    await expect(projectPage.tags.getByRole('listitem')).toHaveText(['Golang', 'Kafka']);
    await expect(projectPage.coverImage('Diagram of the seed featured project')).toBeVisible();
    await expect(projectPage.overview.getByRole('heading', { level: 2 })).toHaveText('Overview');
    await expect(projectPage.keyFeatures.getByRole('listitem')).toHaveText([
      'Event-driven messaging',
      'One-command local setup',
    ]);
    await expect(projectPage.technologies.getByRole('listitem')).toHaveText([
      'Go',
      'Kafka',
      'Docker',
    ]);
  });

  test('renders the overview Markdown body as HTML', async ({ projectPage }) => {
    await projectPage.openProject('seed-featured-project');

    await expect(projectPage.overview.getByText('overview', { exact: true })).toBeVisible();
    await expect(
      projectPage.overview.getByText('It runs a producer and a consumer.'),
    ).toBeVisible();
    await expect(projectPage.overview.getByText('**overview**')).toHaveCount(0);
  });

  test('shows the cover in a 16:9 frame', async ({ projectPage }) => {
    await projectPage.openProject('seed-featured-project');

    const box = await projectPage.coverImage('Diagram of the seed featured project').boundingBox();
    expect(box).not.toBeNull();
    expect((box?.width ?? 0) / (box?.height ?? 1)).toBeCloseTo(16 / 9, 1);
  });

  test('links back to the projects section of the home page @smoke', async ({
    page,
    homePage,
    projectPage,
  }) => {
    await projectPage.openProject('seed-project-without-links');

    await expect(projectPage.backToProjectsLink).toHaveAttribute('href', '/#projects');
    await projectPage.goBackToProjects();

    await expect(page).toHaveURL(/\/#projects$/);
    await expect(homePage.projects).toBeVisible();
  });

  test('renders without script errors', async ({ page, projectPage }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await projectPage.openProject('seed-featured-project');
    await expect(projectPage.heading).toBeVisible();

    expect(errors).toEqual([]);
  });
});

test.describe('[story 2.3] Project page on mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('shows every section without horizontal scrolling', async ({ page, projectPage }) => {
    await projectPage.openProject('seed-featured-project');

    await expect(projectPage.heading).toBeVisible();
    await expect(projectPage.demoLink).toBeVisible();
    await expect(projectPage.technologies).toBeAttached();
    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalScroll).toBe(false);
  });
});
