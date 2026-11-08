import { describe, expect, test } from 'vitest';
import { listRedirects } from './redirect-queries';

describe('[story 1.1] listRedirects', () => {
  test('lists the redirects in file order', async () => {
    expect(await listRedirects()).toEqual([
      { from: '/feed/', to: '/feed.xml', status: 301 },
      { from: '/wp-sitemap.xml', to: '/sitemap.xml', status: 301 },
      { from: '/seed-temporary/', to: '/project/seed-featured-project/', status: 302 },
    ]);
  });
});
