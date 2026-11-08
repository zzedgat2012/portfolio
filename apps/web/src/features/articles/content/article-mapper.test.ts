import type { ArticleFile } from '@portfolio/contracts';
import { describe, expect, test } from 'vitest';
import { buildTagIndex } from '@/features/tags';
import { toArticle, toReadingTimeMinutes } from './article-mapper';

const tagIndex = buildTagIndex([{ slug: 'apex', name: 'Oracle APEX' }]);
const data: ArticleFile = {
  title: 'APEX on OCI',
  summary: 'Custom domain.',
  publishedOn: '2025-12-19',
  tags: ['apex'],
  legacyWpId: 3,
};

describe('[story 1.1] toReadingTimeMinutes', () => {
  test('rounds words / 200 up', () => {
    expect(toReadingTimeMinutes(Array(200).fill('word').join(' '))).toBe(1);
    expect(toReadingTimeMinutes(Array(201).fill('word').join(' '))).toBe(2);
    expect(toReadingTimeMinutes(`  ${Array(3000).fill('w').join('\n\n')}  `)).toBe(15);
  });

  test('is at least one minute', () => {
    expect(toReadingTimeMinutes('')).toBe(1);
  });
});

describe('[story 1.1] toArticle', () => {
  test('maps the entry, resolving tags, computing reading time and dropping legacyWpId', () => {
    const article = toArticle({ slug: 'apex-oci', data, body: 'Short body.' }, tagIndex);

    expect(article).toEqual({
      slug: 'apex-oci',
      title: 'APEX on OCI',
      summary: 'Custom domain.',
      publishedOn: '2025-12-19',
      tags: [{ slug: 'apex', name: 'Oracle APEX' }],
      coverImage: null,
      readingTimeMinutes: 1,
      body: 'Short body.',
    });
    expect(article).not.toHaveProperty('legacyWpId');
  });

  test('maps a cover image with its alt text', () => {
    const article = toArticle(
      { slug: 'a', data: { ...data, coverImage: '/uploads/a.png', coverImageAlt: 'A' }, body: '' },
      tagIndex,
    );

    expect(article.coverImage).toEqual({ src: '/uploads/a.png', alt: 'A' });
  });
});
