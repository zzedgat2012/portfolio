import { expect, test } from '../fixtures';

test.describe('[story 2.3] Project page metadata', () => {
  test('uses "<project> | Edgar Ferreira" as the page title @smoke', async ({
    page,
    projectPage,
  }) => {
    await projectPage.openProject('seed-featured-project');

    await expect(page).toHaveTitle('Seed featured project | Edgar Ferreira');
  });

  // A <meta> has no role, so the description is read from the served HTML, not a locator.
  test('uses the project summary as the meta description', async ({ projectPage }) => {
    const response = await projectPage.openProject('seed-project-without-links');

    expect(await response?.text()).toMatch(
      /<meta name="description" content="A fixture project with neither demo nor code link\."/,
    );
  });
});
