import { expect, test } from '../fixtures';

const SITE_URL = 'https://edgar-ferreira.com';

const INDEXED_URLS = [
  `${SITE_URL}/`,
  `${SITE_URL}/project/seed-featured-project/`,
  `${SITE_URL}/project/seed-project-without-links/`,
  `${SITE_URL}/project/seed-second-featured-project/`,
  `${SITE_URL}/article/seed-article-with-markdown/`,
  `${SITE_URL}/article/seed-another-article/`,
];

test.describe('[story 3.1] Sitemap', () => {
  test('lists the home page, every project and every article as absolute URLs @smoke', async ({
    request,
  }) => {
    const response = await request.get('/sitemap.xml');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/xml/);
    const xml = await response.text();
    const locations = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((match) => match[1]);
    expect(locations.sort()).toEqual([...INDEXED_URLS].sort());
  });

  test('gives every URL a last-modified date, the publication date for articles', async ({
    request,
  }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    const urls = [...xml.matchAll(/<url>(.*?)<\/url>/gs)].map((match) => match[1] ?? '');

    expect(urls).toHaveLength(INDEXED_URLS.length);
    for (const url of urls) {
      expect(url).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}/);
    }
    expect(xml).toMatch(
      /<loc>https:\/\/edgar-ferreira\.com\/article\/seed-another-article\/<\/loc>\s*<lastmod>2024-03-01/,
    );
  });

  test('leaves the printable CV out', async ({ request }) => {
    const response = await request.get('/sitemap.xml');

    expect(response.status()).toBe(200);
    expect(await response.text()).not.toContain('/cv/');
  });
});

test.describe('[story 3.1] robots.txt', () => {
  test('allows every crawler and points to the sitemap @smoke', async ({ request }) => {
    const response = await request.get('/robots.txt');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/text\/plain/);
    const robots = await response.text();
    expect(robots).toMatch(/User-Agent: \*\nAllow: \/\n/i);
    expect(robots).not.toMatch(/Disallow: \/\S/);
    expect(robots).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });
});
