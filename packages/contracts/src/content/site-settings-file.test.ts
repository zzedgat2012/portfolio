import { describe, expect, test } from 'vitest';
import { siteSettingsFileSchema } from './site-settings-file';

describe('siteSettingsFileSchema', () => {
  test('accepts a site name with an optional description', () => {
    expect(siteSettingsFileSchema.parse({ siteName: 'Edgar Ferreira' })).toEqual({
      siteName: 'Edgar Ferreira',
    });
    expect(
      siteSettingsFileSchema.parse({ siteName: 'Edgar Ferreira', description: 'Portfolio' }),
    ).toEqual({ siteName: 'Edgar Ferreira', description: 'Portfolio' });
  });

  test('rejects a missing or empty site name', () => {
    expect(siteSettingsFileSchema.safeParse({}).success).toBe(false);
    expect(siteSettingsFileSchema.safeParse({ siteName: '' }).success).toBe(false);
  });

  test('rejects a description longer than 160 characters', () => {
    const result = siteSettingsFileSchema.safeParse({
      siteName: 'Edgar Ferreira',
      description: 'x'.repeat(161),
    });
    expect(result.success).toBe(false);
  });

  test('rejects fields the content model does not define', () => {
    expect(siteSettingsFileSchema.safeParse({ siteName: 'A', extra: true }).success).toBe(false);
  });
});
