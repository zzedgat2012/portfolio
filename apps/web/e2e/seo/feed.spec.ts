import { expect, test } from '../fixtures';

const SITE_URL = 'https://edgar-ferreira.com';

test.describe('[story 3.1] RSS feed', () => {
  test('is an RSS 2.0 channel of the site @smoke', async ({ request }) => {
    const response = await request.get('/feed.xml');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/xml/);
    const xml = await response.text();
    expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>\s*<rss version="2\.0"/);
    expect(xml).toMatch(/<channel>\s*<title>Edgar Ferreira<\/title>/);
    expect(xml).toContain(`<link>${SITE_URL}/</link>`);
  });

  test('lists every article, newest first, with title, link, guid, date and summary', async ({
    request,
  }) => {
    const xml = await (await request.get('/feed.xml')).text();
    const items = [...xml.matchAll(/<item>(.*?)<\/item>/gs)].map((match) => match[1] ?? '');

    expect(items).toHaveLength(2);
    const [newest, older] = items;
    const url = `${SITE_URL}/article/seed-article-with-markdown/`;
    expect(newest).toContain('<title>Seed article with every Markdown feature</title>');
    expect(newest).toContain(`<link>${url}</link>`);
    expect(newest).toContain(`<guid isPermaLink="true">${url}</guid>`);
    expect(newest).toContain('<pubDate>Fri, 19 Dec 2025 00:00:00 GMT</pubDate>');
    expect(newest).toContain(
      '<description>A fixture article that uses headings, lists, quotes and code.</description>',
    );
    expect(older).toContain('<title>Seed another article</title>');
    expect(older).toContain('<pubDate>Fri, 01 Mar 2024 00:00:00 GMT</pubDate>');
  });
});
