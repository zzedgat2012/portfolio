import { describe, expect, test } from 'vitest';
import { buildSitemapEntries } from './sitemap-entries';

describe('[story 3.1] buildSitemapEntries', () => {
  test('lists the home page, then projects, then articles, as absolute trailing-slash URLs', () => {
    expect(
      buildSitemapEntries({
        siteUrl: 'https://edgar-ferreira.com/',
        builtOn: '2026-11-08',
        projects: [{ slug: 'task-management' }],
        articles: [{ slug: 'modern-css', publishedOn: '2025-06-01' }],
      }),
    ).toEqual([
      { url: 'https://edgar-ferreira.com/', lastModified: '2026-11-08' },
      { url: 'https://edgar-ferreira.com/project/task-management/', lastModified: '2026-11-08' },
      { url: 'https://edgar-ferreira.com/article/modern-css/', lastModified: '2025-06-01' },
    ]);
  });
});
