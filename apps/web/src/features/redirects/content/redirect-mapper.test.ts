import { describe, expect, test } from 'vitest';
import { toRedirects } from './redirect-mapper';

describe('[story 1.1] toRedirects', () => {
  test('maps every redirect of the file', () => {
    expect(toRedirects({ redirects: [{ from: '/feed/', to: '/feed.xml', status: 301 }] })).toEqual([
      { from: '/feed/', to: '/feed.xml', status: 301 },
    ]);
  });
});
