import { describe, expect, test } from 'vitest';
import { tagFileSchema } from './tag-file';

describe('[story 1.1] tagFileSchema', () => {
  test('accepts a name', () => {
    expect(tagFileSchema.parse({ name: 'Golang' })).toEqual({ name: 'Golang' });
  });

  test('rejects an empty name and unknown fields', () => {
    expect(tagFileSchema.safeParse({ name: '' }).success).toBe(false);
    expect(tagFileSchema.safeParse({ name: 'Go', color: 'red' }).success).toBe(false);
  });
});
