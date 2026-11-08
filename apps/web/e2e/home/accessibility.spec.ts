import type { Page } from '@playwright/test';
import { expect, test } from '../fixtures';

async function listHeadingLevels(page: Page): Promise<number[]> {
  return page
    .getByRole('heading')
    .evaluateAll((headings) => headings.map((heading) => Number(heading.tagName.slice(1))));
}

async function expectEveryControlToBeNamed(page: Page): Promise<void> {
  for (const role of ['link', 'button', 'img'] as const) {
    for (const element of await page.getByRole(role).all()) {
      await expect(element).toHaveAccessibleName(/\S/);
    }
  }
}

test.describe('[story 2.2] Home page accessibility', () => {
  test('has one h1 and never skips a heading level @smoke', async ({ page, homePage }) => {
    await homePage.open();
    await expect(homePage.contact).toBeVisible();

    const levels = await listHeadingLevels(page);
    expect(levels.filter((level) => level === 1)).toHaveLength(1);
    expect(levels[0]).toBe(1);
    levels.forEach((level, index) => {
      const previous = levels[index - 1] ?? 1;
      expect(level, `heading ${index} jumps from h${previous}`).toBeLessThanOrEqual(previous + 1);
    });
  });

  test('gives every link, button and image an accessible name', async ({ page, homePage }) => {
    await homePage.open();
    await expect(homePage.nextSlideButton).toBeVisible();

    await expectEveryControlToBeNamed(page);
  });

  test('exposes the five home sections in order', async ({ homePage }) => {
    await homePage.open();

    for (const section of [
      homePage.about,
      homePage.experience,
      homePage.projects,
      homePage.articles,
      homePage.contact,
    ]) {
      await expect(section).toBeAttached();
    }
  });
});

test.describe('[story 2.2] Home page on mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('fits the viewport without horizontal scrolling @smoke', async ({ page, homePage }) => {
    await homePage.open();
    await expect(homePage.nextSlideButton).toBeVisible();

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('stacks the sections in mockup order', async ({ homePage }) => {
    await homePage.open();

    const order = [
      homePage.about,
      homePage.experience,
      homePage.projects,
      homePage.articles,
      homePage.contact,
    ];
    let previousBottom = 0;
    for (const section of order) {
      const box = await section.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.y).toBeGreaterThanOrEqual(previousBottom - 1);
      previousBottom = box!.y + box!.height;
    }
  });
});
