import { describe, expect, test } from 'vitest';
import type { FetchLike } from './parity-check';
import { checkParity, checkPath, formatParityReport, parseLegacyPaths } from './parity-check';

const BASE_URL = 'http://127.0.0.1:3200';

/** A fake server: `routes[path] = [status, location?]`; anything else answers 404. */
function fakeFetch(routes: Record<string, [number, string?]>): FetchLike & { calls: string[] } {
  const calls: string[] = [];
  const fetchFn = async (url: string) => {
    calls.push(url);
    const { pathname } = new URL(url);
    const [status, location] = routes[pathname] ?? [404];
    return {
      status,
      headers: {
        get: (name: string) => (name.toLowerCase() === 'location' ? (location ?? null) : null),
      },
    };
  };
  return Object.assign(fetchFn, { calls });
}

describe('[story 3.1] parseLegacyPaths', () => {
  test('keeps one path per line, ignoring blank lines and # comments', () => {
    expect(parseLegacyPaths('# recorded\n/\n\n/project/a/\n  /feed/  \n')).toEqual([
      '/',
      '/project/a/',
      '/feed/',
    ]);
  });

  test('rejects a line that is not a path', () => {
    expect(() => parseLegacyPaths('https://edgar-ferreira.com/\n')).toThrow(
      'line 1: "https://edgar-ferreira.com/" is not a path',
    );
  });
});

describe('[story 3.1] checkPath', () => {
  test('passes a path that answers 200', async () => {
    const result = await checkPath(BASE_URL, '/', fakeFetch({ '/': [200] }));

    expect(result).toEqual({ path: '/', isOk: true, hops: [{ url: `${BASE_URL}/`, status: 200 }] });
  });

  test('passes a 301 whose Location answers 200, resolving relative locations', async () => {
    const fetchFn = fakeFetch({ '/feed/': [301, '/feed.xml'], '/feed.xml': [200] });

    const result = await checkPath(BASE_URL, '/feed/', fetchFn);

    expect(result.isOk).toBe(true);
    expect(result.hops).toEqual([
      { url: `${BASE_URL}/feed/`, status: 301 },
      { url: `${BASE_URL}/feed.xml`, status: 200 },
    ]);
  });

  test('passes a 308 followed by a 301 to a 200 (two hops)', async () => {
    const fetchFn = fakeFetch({ '/a': [308, '/a/'], '/a/': [301, '/b/'], '/b/': [200] });

    expect((await checkPath(BASE_URL, '/a', fetchFn)).isOk).toBe(true);
  });

  test('fails after more than two redirects', async () => {
    const fetchFn = fakeFetch({ '/a/': [301, '/b/'], '/b/': [301, '/c/'], '/c/': [301, '/d/'] });

    const result = await checkPath(BASE_URL, '/a/', fetchFn);

    expect(result.isOk).toBe(false);
    expect(result.reason).toBe('more than 2 redirects');
    expect(fetchFn.calls).toHaveLength(3);
  });

  test('fails on a 404, a 302 or a redirect that lands on an error', async () => {
    expect(await checkPath(BASE_URL, '/gone/', fakeFetch({}))).toMatchObject({
      isOk: false,
      reason: 'answered 404',
    });
    expect(
      await checkPath(BASE_URL, '/tmp/', fakeFetch({ '/tmp/': [302, '/'], '/': [200] })),
    ).toMatchObject({ isOk: false, reason: 'answered 302' });
    expect(
      await checkPath(BASE_URL, '/old/', fakeFetch({ '/old/': [301, '/missing/'] })),
    ).toMatchObject({ isOk: false, reason: 'answered 404' });
  });

  test('fails on a redirect without a Location header', async () => {
    expect(await checkPath(BASE_URL, '/x/', fakeFetch({ '/x/': [301] }))).toMatchObject({
      isOk: false,
      reason: '301 without Location',
    });
  });

  test('reports a network error as a failure instead of throwing', async () => {
    const result = await checkPath(BASE_URL, '/', async () => {
      throw new Error('ECONNREFUSED');
    });

    expect(result).toMatchObject({ isOk: false, reason: 'ECONNREFUSED' });
  });
});

describe('[story 3.1] checkParity and formatParityReport', () => {
  test('checks every path and prints one table row each plus a summary', async () => {
    const results = await checkParity(
      BASE_URL,
      ['/', '/feed/', '/gone/'],
      fakeFetch({ '/': [200], '/feed/': [301, '/feed.xml'], '/feed.xml': [200] }),
    );

    expect(results.map((result) => result.isOk)).toEqual([true, true, false]);
    const report = formatParityReport(results);
    expect(report).toMatch(/^OK +\/ +200$/m);
    expect(report).toMatch(/^OK +\/feed\/ +301 → \/feed\.xml 200$/m);
    expect(report).toMatch(/^FAIL +\/gone\/ +404 +answered 404$/m);
    expect(report).toMatch(/2 of 3 URLs OK, 1 failed$/);
  });
});
