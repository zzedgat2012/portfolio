import { describe, expect, test } from 'vitest';
import { projectFileSchema } from './project-file';

const minimal = {
  title: 'Kafka + Golang',
  summary: 'A microservice template.',
  coverImage: '/uploads/kafka.png',
  coverImageAlt: 'Architecture diagram',
  sortOrder: 1,
};

describe('[story 1.1] projectFileSchema', () => {
  test('accepts a minimal project and defaults lists and isFeatured', () => {
    expect(projectFileSchema.parse(minimal)).toEqual({
      ...minimal,
      tags: [],
      technologies: [],
      features: [],
      isFeatured: false,
    });
  });

  test('accepts every optional field', () => {
    const full = {
      ...minimal,
      tags: ['golang', 'kafka'],
      technologies: ['Go', 'Docker'],
      features: ['Event-driven'],
      demoUrl: 'https://demo.example.com',
      codeUrl: 'https://github.com/x/y',
      isFeatured: true,
      legacyWpId: 42,
    };
    expect(projectFileSchema.parse(full)).toEqual(full);
  });

  test('rejects a cover image outside /uploads/', () => {
    expect(projectFileSchema.safeParse({ ...minimal, coverImage: 'http://x/y.png' }).success).toBe(
      false,
    );
  });

  test('rejects tag values that are not slugs', () => {
    expect(projectFileSchema.safeParse({ ...minimal, tags: ['Not A Slug'] }).success).toBe(false);
  });

  test('rejects a demo URL that is not http(s)', () => {
    expect(
      projectFileSchema.safeParse({ ...minimal, demoUrl: 'javascript:alert(1)' }).success,
    ).toBe(false);
  });

  test('rejects a missing sortOrder, a fractional sortOrder and unknown fields', () => {
    const { sortOrder: _sortOrder, ...withoutSortOrder } = minimal;
    expect(projectFileSchema.safeParse(withoutSortOrder).success).toBe(false);
    expect(projectFileSchema.safeParse({ ...minimal, sortOrder: 1.5 }).success).toBe(false);
    expect(projectFileSchema.safeParse({ ...minimal, slug: 'x' }).success).toBe(false);
  });
});
