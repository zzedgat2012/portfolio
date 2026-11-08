import { expect, test } from '../fixtures';

const FIXTURE_ARTICLES = [
  { slug: 'seed-article-with-markdown', title: 'Seed article with every Markdown feature' },
  { slug: 'seed-another-article', title: 'Seed another article' },
] as const;

test.describe('[story 2.4] Article page generation', () => {
  for (const { slug, title } of FIXTURE_ARTICLES) {
    test(`serves /article/${slug}/ with its title`, async ({ articlePage }) => {
      const response = await articlePage.openArticle(slug);

      expect(response?.status()).toBe(200);
      await expect(articlePage.heading).toHaveText(title);
    });
  }

  test('answers an unknown article slug with HTTP 404 @smoke', async ({
    articlePage,
    notFoundPage,
  }) => {
    const response = await articlePage.openArticle('seed-missing-article');

    expect(response?.status()).toBe(404);
    await expect(notFoundPage.heading).toBeVisible();
  });

  test('is reached from the "Read more" link on the home page @smoke', async ({
    page,
    homePage,
    articlePage,
  }) => {
    await homePage.open();

    await homePage
      .articleCard('Seed another article')
      .getByRole('link', { name: 'Read more about Seed another article' })
      .click();

    await expect(page).toHaveURL(/\/article\/seed-another-article\/$/);
    await expect(articlePage.heading).toHaveText('Seed another article');
  });
});
