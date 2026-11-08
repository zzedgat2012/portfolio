import { expect, test } from '../fixtures';

test.describe('[story 2.5] CV print page', () => {
  test('renders without the site header, navigation or footer @smoke', async ({ cvPage }) => {
    await cvPage.open();

    await expect(cvPage.main).toBeVisible();
    await expect(cvPage.heading).toHaveText('Edgar Ferreira');
    await expect(cvPage.banner).toHaveCount(0);
    await expect(cvPage.mainNavigation).toHaveCount(0);
    await expect(cvPage.siteFooter).toHaveCount(0);
  });

  test('uses a light print theme: dark ink on white paper', async ({ page, cvPage }) => {
    await page.emulateMedia({ media: 'print' });
    await cvPage.open();

    await expect(cvPage.main).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(cvPage.heading).toHaveCSS('color', 'rgb(18, 18, 18)');
  });

  // A <meta> has no role, so robots and title are read from the served HTML, not a locator.
  test('is excluded from search engines (noindex) and titled "CV | Edgar Ferreira"', async ({
    page,
    cvPage,
  }) => {
    const response = await cvPage.open();

    expect(await response?.text()).toMatch(/<meta name="robots" content="noindex/);
    await expect(page).toHaveTitle('CV | Edgar Ferreira');
  });
});
