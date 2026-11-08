import { expect, test } from '../fixtures';

test.describe('[story 0] Walking skeleton', () => {
  test('shows the site name as the main heading @smoke', async ({ homePage }) => {
    await homePage.open();

    await expect(homePage.heading).toBeVisible();
    await expect(homePage.heading).toHaveText('Edgar Ferreira');
  });

  test('has the site name in the document title @smoke', async ({ page, homePage }) => {
    await homePage.open();

    await expect(page).toHaveTitle(/Edgar Ferreira/);
  });
});
