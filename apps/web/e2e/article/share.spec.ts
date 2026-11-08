import { expect, test } from '../fixtures';

const SLUG = 'seed-article-with-markdown';
const CANONICAL_URL = 'https://edgar-ferreira.com/article/seed-article-with-markdown/';

test.describe('[story 2.4] Share this article', () => {
  test('links to Twitter/X and LinkedIn with the canonical article URL @smoke', async ({
    articlePage,
  }) => {
    await articlePage.openArticle(SLUG);
    const twitter = articlePage.share.getByRole('link', { name: 'Twitter' });
    const linkedIn = articlePage.share.getByRole('link', { name: 'LinkedIn' });

    const twitterUrl = new URL((await twitter.getAttribute('href')) ?? '');
    expect(`${twitterUrl.origin}${twitterUrl.pathname}`).toBe('https://x.com/intent/tweet');
    expect(twitterUrl.searchParams.get('url')).toBe(CANONICAL_URL);
    expect(twitterUrl.searchParams.get('text')).toBe('Seed article with every Markdown feature');

    const linkedInUrl = new URL((await linkedIn.getAttribute('href')) ?? '');
    expect(`${linkedInUrl.origin}${linkedInUrl.pathname}`).toBe(
      'https://www.linkedin.com/sharing/share-offsite/',
    );
    expect(linkedInUrl.searchParams.get('url')).toBe(CANONICAL_URL);

    for (const link of [twitter, linkedIn]) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  test('copies the canonical article URL with Copy Link', async ({ context, articlePage }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await articlePage.installClock();
    await articlePage.openArticle(SLUG);
    await expect(articlePage.copyLinkButton).toHaveAccessibleName('Copy Link');
    await articlePage.pauseClock();

    await articlePage.copyArticleLink();

    expect(await articlePage.readClipboard()).toBe(CANONICAL_URL);
    await expect(articlePage.copyLinkButton).toHaveText('Copied');
    await articlePage.advanceClock(2000);
    await expect(articlePage.copyLinkButton).toHaveText('Copy Link');
  });
});
