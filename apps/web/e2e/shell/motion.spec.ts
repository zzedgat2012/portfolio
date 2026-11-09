import { expect, test } from '../fixtures';

test.describe('[story 4.1] Smooth scrolling', () => {
  test('scrolls anchor links smoothly', async ({ page, siteShell }) => {
    await siteShell.open();

    await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'smooth');
  });
});

test.describe('[story 4.1] Smooth scrolling under reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('jumps to anchors instead of scrolling smoothly', async ({ page, siteShell }) => {
    await siteShell.open();

    await expect(page.locator('html')).toHaveCSS('scroll-behavior', 'auto');
  });
});

test.describe('[story 4.1] Custom scrollbar', () => {
  // Chromium ignores `::-webkit-scrollbar` once `scrollbar-width` is set, so the thin scrollbar is
  // drawn by the webkit rules there and the standard properties are kept for Firefox only.
  test('ships thin webkit scrollbar rules with a thumb hover state', async ({
    page,
    siteShell,
  }) => {
    await siteShell.open();

    const selectors = await siteShell.styleRuleSelectors();
    expect(selectors.some((selector) => selector.includes('::-webkit-scrollbar'))).toBe(true);
    expect(selectors.some((selector) => selector.includes('::-webkit-scrollbar-thumb:hover'))).toBe(
      true,
    );
    await expect(page.locator('html')).not.toHaveCSS('scrollbar-width', 'thin');
  });
});

test.describe('[story 4.1] Page transitions', () => {
  test('keeps the header out of the page transition', async ({ siteShell }) => {
    await siteShell.open();

    await expect(siteShell.banner).toHaveCSS('view-transition-name', 'site-header');
  });

  test('ships the page transition styles', async ({ siteShell }) => {
    await siteShell.open();

    const selectors = await siteShell.styleRuleSelectors();
    expect(selectors.some((selector) => selector.includes('::view-transition-new'))).toBe(true);
    expect(selectors.some((selector) => selector.includes('::view-transition-old'))).toBe(true);
  });

  test('still lands on the project after following a project card @smoke', async ({
    page,
    homePage,
    projectPage,
  }) => {
    await homePage.open();

    await homePage.openProject('Seed featured project');

    await expect(page).toHaveURL(/\/project\/seed-featured-project\/$/);
    await expect(projectPage.heading).toHaveText('Seed featured project');
  });
});

test.describe('[story 4.1] Page transitions when navigating', () => {
  test('fades the new page in, rising, after following a project card', async ({
    homePage,
    projectPage,
    siteShell,
  }) => {
    await siteShell.recordPageTransitions();
    await homePage.open();

    await homePage.openProject('Seed featured project');

    await expect(projectPage.heading).toHaveText('Seed featured project');
    await expect
      .poll(() => siteShell.recordedPageTransitions())
      .toContainEqual(expect.stringMatching(/^::view-transition-new\(.+\) page-rise-in 300$/));
  });
});

// Headless Chromium runs no view-transition animation under emulated reduced motion even without
// the CSS opt-out, so a recorded-animation check cannot fail there; the opt-out rules are read
// from the CSSOM instead.
test.describe('[story 4.1] Page transitions under reduced motion', () => {
  test('turns the page transition animations off', async ({ siteShell }) => {
    await siteShell.open();

    const selectors = await siteShell.styleRuleSelectors('prefers-reduced-motion: reduce');
    for (const pseudo of ['group', 'old', 'new']) {
      // Chromium serializes `(.page)` as `(*.page)`.
      expect(selectors).toContainEqual(
        expect.stringMatching(new RegExp(`::view-transition-${pseudo}\\(\\*?\\.page\\)`)),
      );
      expect(selectors).toContainEqual(expect.stringContaining(`::view-transition-${pseudo}(*)`));
    }
  });
});

test.describe('[story 4.1] Page transitions as one page', () => {
  test('moves the whole page content as one piece after following a project card', async ({
    homePage,
    projectPage,
    siteShell,
  }) => {
    await siteShell.recordPageTransitions();
    await homePage.open();

    await homePage.openProject('Seed featured project');

    await expect(projectPage.heading).toHaveText('Seed featured project');
    await expect
      .poll(() => siteShell.recordedPageTransitions())
      .toContainEqual(expect.stringMatching(/ page-rise-in 300$/));
    const pageAnimations = (await siteShell.recordedPageTransitions()).filter((entry) =>
      / page-(rise-in|fade-out) /.test(entry),
    );
    expect(pageAnimations.filter((entry) => entry.includes('page-rise-in'))).toHaveLength(1);
    expect(pageAnimations.filter((entry) => entry.includes('page-fade-out'))).toHaveLength(1);
  });
});

test.describe('[story 4.1] Page transitions on full page loads', () => {
  // The header section links are plain anchors to `/#…`, so from an article they load a new
  // document: the cross-document view transition runs the page motion on the root. Headless
  // Chromium skips some cross-document snapshots at random (pagereveal without a viewTransition,
  // also when run serially), so the opt-in is read from the CSSOM instead of recorded animations.
  test('opts every page into the page motion on full page loads', async ({ articlePage, page }) => {
    await articlePage.openArticle('seed-another-article');

    const optIn = await page.evaluate(() =>
      Array.from(document.styleSheets)
        .flatMap((sheet) => Array.from(sheet.cssRules))
        .filter((rule) => rule.cssText.startsWith('@view-transition'))
        .map((rule) => rule.cssText.replace(/\s+/g, ' ')),
    );
    expect(optIn).toContainEqual(expect.stringMatching(/navigation: auto; types: page-load;/));

    const rootSelectors = await page.evaluate(() =>
      Array.from(document.styleSheets)
        .flatMap((sheet) => Array.from(sheet.cssRules))
        .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule)
        .filter((rule) => rule.selectorText.includes('active-view-transition-type(page-load)'))
        .map((rule) => rule.cssText.replace(/\s+/g, ' ')),
    );
    expect(rootSelectors).toContainEqual(
      expect.stringMatching(/view-transition-old\(root\) \{ animation: .*page-fade-out; \}$/),
    );
    expect(rootSelectors).toContainEqual(
      expect.stringMatching(/view-transition-new\(root\) \{ animation: .*page-rise-in; \}$/),
    );
  });
});
