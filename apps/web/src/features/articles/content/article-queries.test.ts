import { NotFoundError } from '@portfolio/contracts';
import { describe, expect, test } from 'vitest';
import { getArticleBySlug, listArticles } from './article-queries';

describe('[story 1.1] article queries', () => {
  test('listArticles returns every article, newest first', async () => {
    const articles = await listArticles();

    expect(articles.map((article) => [article.slug, article.publishedOn])).toEqual([
      ['seed-article-with-markdown', '2025-12-19'],
      ['seed-another-article', '2024-03-01'],
    ]);
  });

  test('getArticleBySlug returns the article with tags, cover and reading time', async () => {
    const article = await getArticleBySlug('seed-article-with-markdown');

    expect(article).toMatchObject({
      title: 'Seed article with every Markdown feature',
      tags: [
        { slug: 'seed-oracle-apex', name: 'Oracle APEX' },
        { slug: 'seed-typescript', name: 'TypeScript' },
      ],
      coverImage: {
        src: '/uploads/seed-article-with-markdown.png',
        alt: 'Cover of the seed article',
      },
      readingTimeMinutes: 1,
    });
    expect(article.body).toContain('```js title="hello.js"');
  });

  test('getArticleBySlug throws NotFoundError for an unknown slug', async () => {
    await expect(getArticleBySlug('missing')).rejects.toThrow(NotFoundError);
  });
});
