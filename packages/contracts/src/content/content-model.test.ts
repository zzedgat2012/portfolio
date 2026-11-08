import { describe, expect, test } from 'vitest';
import { contentModel } from './content-model';

describe('contentModel', () => {
  test('registers the site settings file', () => {
    expect(contentModel.files['settings/site']?.path).toBe('settings/site.yml');
  });

  test('[story 1.1] registers every collection of architecture D2', () => {
    expect(Object.keys(contentModel.files).sort()).toEqual([
      'settings/profile',
      'settings/redirects',
      'settings/site',
    ]);
    expect(contentModel.files['settings/profile'].path).toBe('settings/profile.yml');
    expect(contentModel.files['settings/redirects'].path).toBe('settings/redirects.yml');
    expect(Object.keys(contentModel.folders).sort()).toEqual(['articles', 'projects', 'tags']);
    expect(contentModel.folders.projects.extension).toBe('md');
    expect(contentModel.folders.articles.extension).toBe('md');
    expect(contentModel.folders.tags.extension).toBe('yml');
  });

  test('[story 1.1] declares project and article tags as relations to tags', () => {
    expect(contentModel.folders.projects.relations).toEqual([
      { field: 'tags', collection: 'tags' },
    ]);
    expect(contentModel.folders.articles.relations).toEqual([
      { field: 'tags', collection: 'tags' },
    ]);
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
