import { describe, expect, test } from 'vitest';
import { contentModel } from './content-model';
import { listBrokenRelations } from './relations';

const tags = [{ slug: 'golang', data: { name: 'Golang' } }];

describe('[story 1.1] listBrokenRelations', () => {
  test('returns nothing when every relation resolves', () => {
    expect(
      listBrokenRelations(contentModel, {
        tags,
        projects: [{ slug: 'p', data: { tags: ['golang'] } }],
        articles: [{ slug: 'a', data: { tags: [] } }],
      }),
    ).toEqual([]);
  });

  test('names the file, the field and the missing slug', () => {
    expect(
      listBrokenRelations(contentModel, {
        tags,
        projects: [{ slug: 'p', data: { tags: ['golang', 'kafka'] } }],
        articles: [{ slug: 'a', data: { tags: ['rust'] } }],
      }),
    ).toEqual([
      'projects/p.md: tags references "kafka", which is not in tags',
      'articles/a.md: tags references "rust", which is not in tags',
    ]);
  });

  test('treats a missing target collection as empty', () => {
    expect(
      listBrokenRelations(contentModel, { projects: [{ slug: 'p', data: { tags: ['x'] } }] }),
    ).toEqual(['projects/p.md: tags references "x", which is not in tags']);
  });
});
