import { readFile } from 'node:fs/promises';
import { describe, expect, test } from 'vitest';
import { mapArticlePageToExtras } from './article-page';

describe('[story 1.2] mapArticlePageToExtras', () => {
  test('reads the publication date shown on the recorded article page', async () => {
    const html = await readFile(
      new URL('../../fixtures/html/article-kafka-golang-setup.html', import.meta.url),
      'utf8',
    );
    expect(mapArticlePageToExtras(html)).toEqual({ publishedOn: '2024-01-15' });
  });

  test('returns a null date when the page shows none', () => {
    expect(mapArticlePageToExtras('<main><article></article></main>')).toEqual({
      publishedOn: null,
    });
  });
});
