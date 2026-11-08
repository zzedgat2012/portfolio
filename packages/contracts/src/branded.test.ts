import { describe, expect, test } from 'vitest';
import { isSlug } from './branded';

describe('isSlug', () => {
  test('accepts kebab-case slugs', () => {
    expect(isSlug('brand-refresh')).toBe(true);
    expect(isSlug('seed-project-2')).toBe(true);
  });

  test('rejects anything that could escape a content folder', () => {
    expect(isSlug('../secrets')).toBe(false);
    expect(isSlug('a/b')).toBe(false);
    expect(isSlug('Upper-Case')).toBe(false);
    expect(isSlug('')).toBe(false);
    expect(isSlug('trailing-')).toBe(false);
  });
});
