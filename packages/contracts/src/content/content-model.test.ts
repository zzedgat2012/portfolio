import { describe, expect, test } from 'vitest';
import { contentModel } from './content-model';

describe('contentModel', () => {
  test('registers the site settings file', () => {
    expect(contentModel.files['settings/site']?.path).toBe('settings/site.yml');
  });

  test('keys files as <collection>/<file> and folders by collection name', () => {
    for (const key of Object.keys(contentModel.files)) {
      expect(key).toMatch(/^[a-z0-9-]+\/[a-z0-9-]+$/);
    }
    for (const key of Object.keys(contentModel.folders)) {
      expect(key).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
