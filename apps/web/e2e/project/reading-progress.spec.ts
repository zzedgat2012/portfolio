import { expect, test } from '../fixtures';

// The bar is decorative (aria-hidden), so it has no role or name: it is located by test id
// (`siteShell.readingProgress`), the documented exception to the role-first locator rule.

// A short viewport, so the fixture content is taller than the window and the page scrolls.
const SMALL_VIEWPORT = { width: 390, height: 640 } as const;

test.describe('[story 4.1] Project page reading progress', () => {
  test.use({ viewport: SMALL_VIEWPORT });

  test('shows a decorative progress bar @smoke', async ({ projectPage, siteShell }) => {
    await projectPage.openProject('seed-featured-project');

    await expect(siteShell.readingProgress).toHaveCount(1);
    await expect(siteShell.readingProgress).toHaveAttribute('aria-hidden', 'true');
    await expect(siteShell.readingProgress).not.toHaveAttribute('tabindex');
  });

  test('grows to the full width once the page is read to the end', async ({
    projectPage,
    siteShell,
  }) => {
    await projectPage.openProject('seed-featured-project');
    await expect(siteShell.readingProgress).toBeAttached();
    const startWidth = await siteShell.readingProgressWidth();

    await siteShell.readToTheEnd();

    await expect
      .poll(() => siteShell.readingProgressWidth())
      .toBeGreaterThan(SMALL_VIEWPORT.width - 1);
    expect(startWidth).toBeLessThan(SMALL_VIEWPORT.width / 2);
  });

  test('lets clicks pass through to the header', async ({ projectPage, siteShell }) => {
    await projectPage.openProject('seed-featured-project');

    await expect(siteShell.readingProgress).toHaveCSS('pointer-events', 'none');
  });

  test('is hidden in print', async ({ page, projectPage, siteShell }) => {
    await page.emulateMedia({ media: 'print' });
    await projectPage.openProject('seed-featured-project');

    await expect(siteShell.readingProgress).toBeHidden();
  });
});

test.describe('[story 4.1] Project page reading progress under reduced motion', () => {
  test.use({ viewport: SMALL_VIEWPORT, reducedMotion: 'reduce' });

  test('tracks the position without animating', async ({ projectPage, siteShell }) => {
    await projectPage.openProject('seed-featured-project');

    await expect(siteShell.readingProgress).toHaveCSS('transition-property', 'none');
    await siteShell.readToTheEnd();
    await expect
      .poll(() => siteShell.readingProgressWidth())
      .toBeGreaterThan(SMALL_VIEWPORT.width - 1);
  });
});

test.describe('[story 4.1] Reading progress elsewhere', () => {
  test('is absent on the home page', async ({ homePage, siteShell }) => {
    await homePage.open();

    await expect(homePage.heading).toBeVisible();
    await expect(siteShell.readingProgress).toHaveCount(0);
  });

  test('is absent on the CV page', async ({ cvPage, siteShell }) => {
    await cvPage.open();

    await expect(cvPage.heading).toBeVisible();
    await expect(siteShell.readingProgress).toHaveCount(0);
  });

  test('is absent on the not-found page', async ({ notFoundPage, siteShell }) => {
    await notFoundPage.openMissing('/no-such-page/');

    await expect(notFoundPage.heading).toBeVisible();
    await expect(siteShell.readingProgress).toHaveCount(0);
  });
});
