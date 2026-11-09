import { expect, test } from '../fixtures';

test.describe('[story 3.1] Redirects', () => {
  test('the old WordPress feed answers 301 to the new feed @smoke', async ({ request }) => {
    const response = await request.get('/feed/', { maxRedirects: 0 });

    expect(response.status()).toBe(301);
    expect(response.headers().location).toBe('/feed.xml');
  });

  test('the old WordPress sitemap answers 301 to the new sitemap @smoke', async ({ request }) => {
    const response = await request.get('/wp-sitemap.xml', { maxRedirects: 0 });

    expect(response.status()).toBe(301);
    expect(response.headers().location).toBe('/sitemap.xml');
  });

  test('a temporary redirect from the content answers 302', async ({ request }) => {
    const response = await request.get('/seed-temporary/', { maxRedirects: 0 });

    expect(response.status()).toBe(302);
    expect(response.headers().location).toBe('/project/seed-featured-project/');
  });

  test('following the old feed URL lands on the RSS feed', async ({ request }) => {
    const response = await request.get('/feed/');

    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('<rss version="2.0"');
  });
});
