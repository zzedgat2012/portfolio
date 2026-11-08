import { describe, expect, test } from 'vitest';
import { toSiteSettings } from './site-settings-mapper';

const SITE_URL = 'https://edgar-ferreira.com';

describe('toSiteSettings', () => {
  test('maps the settings file to the domain model', () => {
    expect(
      toSiteSettings({ siteName: 'Edgar Ferreira', description: 'Portfolio', siteUrl: SITE_URL }),
    ).toEqual({
      siteName: 'Edgar Ferreira',
      description: 'Portfolio',
      siteUrl: SITE_URL,
    });
  });

  test('uses null when the description is missing', () => {
    expect(toSiteSettings({ siteName: 'Edgar Ferreira', siteUrl: SITE_URL })).toEqual({
      siteName: 'Edgar Ferreira',
      description: null,
      siteUrl: SITE_URL,
    });
  });
});
