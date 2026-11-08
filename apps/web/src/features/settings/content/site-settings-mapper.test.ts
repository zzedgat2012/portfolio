import { describe, expect, test } from 'vitest';
import { toSiteSettings } from './site-settings-mapper';

describe('toSiteSettings', () => {
  test('maps the settings file to the domain model', () => {
    expect(toSiteSettings({ siteName: 'Edgar Ferreira', description: 'Portfolio' })).toEqual({
      siteName: 'Edgar Ferreira',
      description: 'Portfolio',
    });
  });

  test('uses null when the description is missing', () => {
    expect(toSiteSettings({ siteName: 'Edgar Ferreira' })).toEqual({
      siteName: 'Edgar Ferreira',
      description: null,
    });
  });
});
