import { expect, test } from '../fixtures';

const FIXTURE_PROJECTS = [
  { slug: 'seed-project-without-links', title: 'Seed project without links' },
  { slug: 'seed-featured-project', title: 'Seed featured project' },
  { slug: 'seed-second-featured-project', title: 'Seed second featured project' },
] as const;

test.describe('[story 2.3] Project page generation', () => {
  for (const { slug, title } of FIXTURE_PROJECTS) {
    test(`serves /project/${slug}/ with its title`, async ({ projectPage }) => {
      const response = await projectPage.openProject(slug);

      expect(response?.status()).toBe(200);
      await expect(projectPage.heading).toHaveText(title);
    });
  }

  test('answers an unknown project slug with HTTP 404 @smoke', async ({
    projectPage,
    notFoundPage,
  }) => {
    const response = await projectPage.openProject('seed-missing-project');

    expect(response?.status()).toBe(404);
    await expect(notFoundPage.heading).toBeVisible();
  });

  test('is reached from the "Read more" link on the home page @smoke', async ({
    page,
    homePage,
    projectPage,
  }) => {
    await homePage.open();

    await homePage.projects
      .getByRole('link', { name: 'Read more about Seed featured project' })
      .click();

    await expect(page).toHaveURL(/\/project\/seed-featured-project\/$/);
    await expect(projectPage.heading).toHaveText('Seed featured project');
  });
});
