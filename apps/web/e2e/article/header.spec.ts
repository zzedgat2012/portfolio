import { expect, test } from '../fixtures';

const SLUG = 'seed-article-with-markdown';

test.describe('[story 2.4] Article header', () => {
  test('shows tags, title, long date, reading time and the author @smoke', async ({
    articlePage,
  }) => {
    await articlePage.openArticle(SLUG);

    await expect(articlePage.tags.getByRole('listitem')).toHaveText(['Oracle APEX', 'TypeScript']);
    await expect(articlePage.heading).toHaveText('Seed article with every Markdown feature');
    await expect(articlePage.publishedOn).toHaveText('December 19, 2025');
    await expect(articlePage.publishedOn).toHaveAttribute('datetime', '2025-12-19');
    await expect(articlePage.readingTime).toHaveText('1 min');
    await expect(
      articlePage.author.getByRole('img', { name: 'Portrait of Edgar Ferreira' }),
    ).toBeVisible();
    await expect(articlePage.author.getByText('Edgar Ferreira', { exact: true })).toBeVisible();
    await expect(articlePage.author.getByText('Product Engineer', { exact: true })).toBeVisible();
  });

  test('links back to the articles section of the home page @smoke', async ({
    page,
    homePage,
    articlePage,
  }) => {
    await articlePage.openArticle('seed-another-article');

    await expect(articlePage.backToArticlesLink).toHaveAttribute('href', '/#articles');
    await articlePage.goBackToArticles();

    await expect(page).toHaveURL(/\/#articles$/);
    await expect(homePage.articles).toBeVisible();
  });

  test('renders without script errors', async ({ page, articlePage }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await articlePage.openArticle(SLUG);
    await expect(articlePage.heading).toBeVisible();

    expect(errors).toEqual([]);
  });
});

test.describe('[story 2.4] Article page on mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('shows the article without horizontal page scrolling', async ({ page, articlePage }) => {
    await articlePage.openArticle(SLUG);

    await expect(articlePage.heading).toBeVisible();
    await expect(articlePage.codeBlock('hello.js')).toBeVisible();
    await expect(articlePage.authorCard).toBeAttached();
    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(hasHorizontalScroll).toBe(false);
  });
});
