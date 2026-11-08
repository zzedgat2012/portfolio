import { expect, test } from '../fixtures';

const FIRST = 'Seed featured project';
const SECOND = 'Seed second featured project';

test.describe('[story 2.2] Featured projects carousel', () => {
  test('is announced as a carousel of featured projects @smoke', async ({ homePage }) => {
    await homePage.open();

    await expect(homePage.carousel).toBeVisible();
    await expect(homePage.carousel).toHaveAttribute('aria-roledescription', 'carousel');
    await expect(homePage.slide(1, 2)).toHaveAttribute('aria-roledescription', 'slide');
  });

  test('shows the first featured project with tags, title, summary and link @smoke', async ({
    homePage,
  }) => {
    await homePage.open();

    const slide = homePage.slide(1, 2);
    await expect(slide.getByRole('heading', { name: FIRST })).toBeVisible();
    await expect(
      slide.getByText('A featured fixture project with demo and code links.'),
    ).toBeVisible();
    await expect(slide.getByRole('listitem').filter({ hasText: 'Golang' })).toBeVisible();
    await expect(slide.getByRole('listitem').filter({ hasText: 'Kafka' })).toBeVisible();
    await expect(homePage.featuredProjectLink(FIRST)).toHaveAttribute(
      'href',
      '/project/seed-featured-project/',
    );
  });

  test('moves to the next and previous project with the buttons', async ({ homePage }) => {
    await homePage.open();

    await homePage.showNextProject();
    await expect(homePage.featuredProjectLink(SECOND)).toBeVisible();
    await expect(homePage.featuredProjectLink(FIRST)).toBeHidden();

    await homePage.showPreviousProject();
    await expect(homePage.featuredProjectLink(FIRST)).toBeVisible();
    await expect(homePage.featuredProjectLink(SECOND)).toBeHidden();
  });

  test('wraps around from the first project to the last', async ({ homePage }) => {
    await homePage.open();

    await homePage.showPreviousProject();

    await expect(homePage.featuredProjectLink(SECOND)).toBeVisible();
  });

  test('jumps to a project with its dot and marks it as current', async ({ homePage }) => {
    await homePage.open();

    await expect(homePage.slidePicker(1)).toHaveAttribute('aria-current', 'true');
    await homePage.pickProject(2);

    await expect(homePage.slidePicker(2)).toHaveAttribute('aria-current', 'true');
    await expect(homePage.slidePicker(1)).not.toHaveAttribute('aria-current', 'true');
    await expect(homePage.featuredProjectLink(SECOND)).toBeVisible();
  });

  test('is operable from the keyboard', async ({ page, homePage }) => {
    await homePage.open();

    await homePage.nextSlideButton.focus();
    await page.keyboard.press('Enter');
    await expect(homePage.featuredProjectLink(SECOND)).toBeVisible();

    await page.keyboard.press('ArrowLeft');
    await expect(homePage.featuredProjectLink(FIRST)).toBeVisible();

    await page.keyboard.press('ArrowRight');
    await expect(homePage.featuredProjectLink(SECOND)).toBeVisible();
  });

  test('never advances on its own', async ({ page, homePage }) => {
    await page.clock.install();
    await homePage.open();
    await expect(homePage.nextSlideButton).toBeVisible();

    await page.clock.runFor(60_000);

    await expect(homePage.featuredProjectLink(FIRST)).toBeVisible();
    await expect(homePage.featuredProjectLink(SECOND)).toBeHidden();
  });
});

test.describe('[story 2.2] Featured projects carousel without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('shows the first project and keeps every project reachable as a link @smoke', async ({
    homePage,
  }) => {
    await homePage.open();
    await homePage.carousel.scrollIntoViewIfNeeded();

    await expect(homePage.featuredProjectLink(FIRST)).toBeInViewport();
    await expect(homePage.featuredProjectLink(FIRST)).toHaveAttribute(
      'href',
      '/project/seed-featured-project/',
    );
    await expect(homePage.featuredProjectLink(SECOND)).toBeAttached();
    await expect(homePage.featuredProjectLink(SECOND)).toHaveAttribute(
      'href',
      '/project/seed-second-featured-project/',
    );
  });
});
