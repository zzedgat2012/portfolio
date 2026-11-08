import { expect, test } from '../fixtures';

test.describe('[story 2.4] Article page metadata', () => {
  test('uses "<article> | Edgar Ferreira" as the page title @smoke', async ({
    page,
    articlePage,
  }) => {
    await articlePage.openArticle('seed-article-with-markdown');

    await expect(page).toHaveTitle('Seed article with every Markdown feature | Edgar Ferreira');
  });

  // A <meta> has no role, so the description is read from the served HTML, not a locator.
  test('uses the article summary as the meta description', async ({ articlePage }) => {
    const response = await articlePage.openArticle('seed-another-article');

    expect(await response?.text()).toMatch(
      /<meta name="description" content="An older fixture article without a cover image\."/,
    );
  });
});
