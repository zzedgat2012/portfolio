import { describe, expect, test } from 'vitest';
import { getSiteSettings } from './site-settings-queries';

describe('[story 1.1] getSiteSettings', () => {
  test('reads the site settings, including siteUrl', async () => {
    expect(await getSiteSettings()).toEqual({
      siteName: 'Edgar Ferreira',
      description: 'Fixture site used by the end-to-end tests.',
      siteUrl: 'https://edgar-ferreira.com',
    });
  });
});
