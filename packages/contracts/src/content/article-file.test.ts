import { describe, expect, test } from 'vitest';
import { articleFileSchema } from './article-file';

const minimal = {
  title: 'Oracle APEX on OCI',
  summary: 'Custom domain and OAuth.',
  publishedOn: '2025-12-19',
};

describe('[story 1.1] articleFileSchema', () => {
  test('accepts a minimal article and defaults tags to []', () => {
    expect(articleFileSchema.parse(minimal)).toEqual({ ...minimal, tags: [] });
  });

  test('accepts a cover image with its alt text and a legacy id', () => {
    const full = {
      ...minimal,
      tags: ['oracle-apex'],
      coverImage: '/uploads/apex.png',
      coverImageAlt: 'APEX logo',
      legacyWpId: 7,
    };
    expect(articleFileSchema.parse(full)).toEqual(full);
  });

  test('rejects a publishedOn that is not YYYY-MM-DD', () => {
    expect(articleFileSchema.safeParse({ ...minimal, publishedOn: '19/12/2025' }).success).toBe(
      false,
    );
    expect(articleFileSchema.safeParse({ ...minimal, publishedOn: '2025-13-01' }).success).toBe(
      false,
    );
  });

  test('rejects a cover image without alt text', () => {
    expect(
      articleFileSchema.safeParse({ ...minimal, coverImage: '/uploads/apex.png' }).success,
    ).toBe(false);
  });
});
