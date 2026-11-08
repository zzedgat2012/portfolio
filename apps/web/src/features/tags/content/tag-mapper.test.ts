import { ValidationError } from '@portfolio/contracts';
import { describe, expect, test } from 'vitest';
import { buildTagIndex, toTag, toTags } from './tag-mapper';

describe('[story 1.1] tag mapper', () => {
  test('maps a tag entry to its slug and name', () => {
    expect(toTag({ slug: 'golang', data: { name: 'Golang' }, body: '' })).toEqual({
      slug: 'golang',
      name: 'Golang',
    });
  });

  test('resolves slugs to tags, keeping their order', () => {
    const index = buildTagIndex([
      { slug: 'golang', name: 'Golang' },
      { slug: 'kafka', name: 'Kafka' },
    ]);

    expect(toTags(['kafka', 'golang'], index)).toEqual([
      { slug: 'kafka', name: 'Kafka' },
      { slug: 'golang', name: 'Golang' },
    ]);
  });

  test('throws a ValidationError naming an unknown slug', () => {
    expect(() => toTags(['rust'], buildTagIndex([]))).toThrow(ValidationError);
    expect(() => toTags(['rust'], buildTagIndex([]))).toThrow('rust');
  });
});
