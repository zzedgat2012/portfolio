import { describe, expect, test } from 'vitest';
import { resolveContentDir } from './content-dir';

describe('[story 3.1] resolveContentDir', () => {
  test('defaults to the repo-root content/ seen from apps/web', () => {
    expect(resolveContentDir({}, '/repo/apps/web')).toBe('/repo/content');
  });

  test('resolves CONTENT_DIR relative to apps/web', () => {
    expect(resolveContentDir({ CONTENT_DIR: 'e2e/content' }, '/repo/apps/web')).toBe(
      '/repo/apps/web/e2e/content',
    );
  });
});
