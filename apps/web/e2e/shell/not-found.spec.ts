import { expect, test } from '../fixtures';

const MISSING_PATH = '/projetos/antigo/';

test.describe('[story 2.1] Not-found page', () => {
  test('answers an unknown URL with HTTP 404 @smoke', async ({ notFoundPage }) => {
    const response = await notFoundPage.openMissing(MISSING_PATH);

    expect(response?.status()).toBe(404);
    await expect(notFoundPage.heading).toBeVisible();
  });

  test('explains the page does not exist and shows the attempted path', async ({
    page,
    notFoundPage,
  }) => {
    await notFoundPage.openMissing(MISSING_PATH);

    await expect(page.getByText('Page not found')).toBeVisible();
    await expect(notFoundPage.message).toBeVisible();
    await expect(notFoundPage.attemptedPath).toBeVisible();
    await expect(page.getByText(MISSING_PATH)).toBeVisible();
  });

  test('has the not-found title', async ({ page, notFoundPage }) => {
    await notFoundPage.openMissing(MISSING_PATH);

    await expect(page).toHaveTitle(/Page not found/);
  });

  test('links back to the home page @smoke', async ({ page, notFoundPage }) => {
    await notFoundPage.openMissing(MISSING_PATH);

    await notFoundPage.goHome();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Edgar Ferreira' })).toBeVisible();
  });

  test('returns to the previous page with Go Back', async ({ page, siteShell, notFoundPage }) => {
    await siteShell.open();
    await notFoundPage.openMissing(MISSING_PATH);

    await notFoundPage.goBackButton.click();

    await expect(page).toHaveURL(/\/$/);
  });

  test('suggests the Projects, About and Work sections', async ({ notFoundPage }) => {
    await notFoundPage.openMissing(MISSING_PATH);

    const suggestions = notFoundPage.suggestions;
    await expect(suggestions.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'href',
      '/#projects',
    );
    await expect(suggestions.getByRole('link', { name: 'About' })).toHaveAttribute(
      'href',
      '/#about',
    );
    await expect(suggestions.getByRole('link', { name: 'Work' })).toHaveAttribute(
      'href',
      '/#experience',
    );
  });

  test('renders without script errors', async ({ page, notFoundPage }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await notFoundPage.openMissing(MISSING_PATH);
    await expect(page.getByText(MISSING_PATH)).toBeVisible();

    expect(errors).toEqual([]);
  });
});

test.describe('[story 2.1] Not-found page on mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('shows the message and the way home @smoke', async ({ notFoundPage }) => {
    const response = await notFoundPage.openMissing(MISSING_PATH);

    expect(response?.status()).toBe(404);
    await expect(notFoundPage.heading).toBeVisible();
    await expect(notFoundPage.message).toBeVisible();
    await expect(notFoundPage.backHomeLink).toBeVisible();
    await expect(notFoundPage.goBackButton).toBeVisible();
  });
});
