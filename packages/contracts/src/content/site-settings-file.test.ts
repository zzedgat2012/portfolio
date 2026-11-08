import { describe, expect, test } from 'vitest';
import { siteSettingsFileSchema } from './site-settings-file';

const SITE_URL = 'https://edgar-ferreira.com';

describe('siteSettingsFileSchema', () => {
  test('accepts a site name and URL with an optional description', () => {
    expect(siteSettingsFileSchema.parse({ siteName: 'Edgar Ferreira', siteUrl: SITE_URL })).toEqual(
      { siteName: 'Edgar Ferreira', siteUrl: SITE_URL },
    );
    expect(
      siteSettingsFileSchema.parse({
        siteName: 'Edgar Ferreira',
        siteUrl: SITE_URL,
        description: 'Portfolio',
      }),
    ).toEqual({ siteName: 'Edgar Ferreira', siteUrl: SITE_URL, description: 'Portfolio' });
  });

  test('[story 1.1] requires an absolute site URL without a trailing slash', () => {
    expect(siteSettingsFileSchema.safeParse({ siteName: 'A' }).success).toBe(false);
    expect(
      siteSettingsFileSchema.safeParse({ siteName: 'A', siteUrl: `${SITE_URL}/` }).success,
    ).toBe(false);
    expect(siteSettingsFileSchema.safeParse({ siteName: 'A', siteUrl: 'edgar.com' }).success).toBe(
      false,
    );
  });

  test('rejects a missing or empty site name', () => {
    expect(siteSettingsFileSchema.safeParse({}).success).toBe(false);
    expect(siteSettingsFileSchema.safeParse({ siteName: '' }).success).toBe(false);
  });

  test('rejects a description longer than 160 characters', () => {
    const result = siteSettingsFileSchema.safeParse({
      siteName: 'Edgar Ferreira',
      siteUrl: SITE_URL,
      description: 'x'.repeat(161),
    });
    expect(result.success).toBe(false);
  });

  test('rejects fields the content model does not define', () => {
    expect(
      siteSettingsFileSchema.safeParse({ siteName: 'A', siteUrl: SITE_URL, extra: true }).success,
    ).toBe(false);
  });
});
