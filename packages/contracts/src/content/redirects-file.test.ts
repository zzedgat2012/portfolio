import { describe, expect, test } from 'vitest';
import { redirectsFileSchema } from './redirects-file';

describe('[story 1.1] redirectsFileSchema', () => {
  test('accepts 301 and 302 redirects', () => {
    const file = {
      redirects: [
        { from: '/feed/', to: '/feed.xml', status: 301 },
        { from: '/old/', to: 'https://example.com/new/', status: 302 },
      ],
    };
    expect(redirectsFileSchema.parse(file)).toEqual(file);
  });

  test('defaults to no redirects', () => {
    expect(redirectsFileSchema.parse({})).toEqual({ redirects: [] });
  });

  test('rejects other statuses, relative sources and duplicate sources', () => {
    expect(
      redirectsFileSchema.safeParse({ redirects: [{ from: '/a/', to: '/b/', status: 307 }] })
        .success,
    ).toBe(false);
    expect(
      redirectsFileSchema.safeParse({ redirects: [{ from: 'a/', to: '/b/', status: 301 }] })
        .success,
    ).toBe(false);
    expect(
      redirectsFileSchema.safeParse({
        redirects: [
          { from: '/a/', to: '/b/', status: 301 },
          { from: '/a/', to: '/c/', status: 301 },
        ],
      }).success,
    ).toBe(false);
  });

  test('rejects a redirect to itself', () => {
    expect(
      redirectsFileSchema.safeParse({ redirects: [{ from: '/a/', to: '/a/', status: 301 }] })
        .success,
    ).toBe(false);
  });
});
