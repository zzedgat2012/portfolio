import { expect, test } from '../fixtures';

test.describe('[story 2.4] Article author card', () => {
  test('shows "Written by" the author with a bio line and a link to more articles @smoke', async ({
    articlePage,
  }) => {
    await articlePage.openArticle('seed-article-with-markdown');
    const { authorCard } = articlePage;

    await expect(
      authorCard.getByRole('heading', { name: 'Written by Edgar Ferreira' }),
    ).toBeVisible();
    await expect(
      authorCard.getByText(
        'Designs digital products end-to-end, combining strategy, design thinking, and engineering so each release is measurable.',
      ),
    ).toBeVisible();
    await expect(authorCard.getByRole('link', { name: 'Read more articles' })).toHaveAttribute(
      'href',
      '/#articles',
    );
  });
});
