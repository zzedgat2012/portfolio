import { expect, test } from '../fixtures';

test.describe('[story 2.2] Articles section', () => {
  test('shows a card for every article, newest first @smoke', async ({ homePage }) => {
    await homePage.open();

    await expect(homePage.articles).toHaveAttribute('id', 'articles');
    await expect(homePage.articles.getByRole('heading', { level: 3 })).toHaveText([
      'Seed article with every Markdown feature',
      'Seed another article',
    ]);
  });

  test('shows the summary and a "Read more" link to the article', async ({ homePage }) => {
    await homePage.open();

    const card = homePage.articleCard('Seed another article');
    await expect(card.getByText('An older fixture article without a cover image.')).toBeVisible();
    await expect(
      card.getByRole('link', { name: 'Read more about Seed another article' }),
    ).toHaveAttribute('href', '/article/seed-another-article/');
  });
});
