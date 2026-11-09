import { expect, test } from '../fixtures';
import { ServedHtml } from '../pages/served-html';

const SITE_URL = 'https://edgar-ferreira.com';

test.describe('[story 3.1] Page metadata', () => {
  test('the home page is titled with the site name and canonical to the site root @smoke', async ({
    page,
  }) => {
    const head = await ServedHtml.of(await page.goto('/'));

    await expect(page).toHaveTitle('Edgar Ferreira');
    expect(head.documentLanguage()).toBe('en');
    expect(head.meta('description')).toBe('Fixture site used by the end-to-end tests.');
    expect(head.canonicalUrl()).toBe(`${SITE_URL}/`);
  });

  test('the home page shares the portrait as its Open Graph and Twitter image', async ({
    page,
  }) => {
    const head = await ServedHtml.of(await page.goto('/'));

    expect(head.meta('og:type')).toBe('website');
    expect(head.meta('og:url')).toBe(`${SITE_URL}/`);
    expect(head.meta('og:title')).toBe('Edgar Ferreira');
    expect(head.meta('og:site_name')).toBe('Edgar Ferreira');
    expect(head.meta('og:image')).toBe(`${SITE_URL}/uploads/seed-portrait.png`);
    expect(head.meta('og:image:alt')).toBe('Portrait of Edgar Ferreira');
    expect(head.meta('twitter:card')).toBe('summary_large_image');
    expect(head.meta('twitter:image')).toBe(`${SITE_URL}/uploads/seed-portrait.png`);
  });

  test('a project page is canonical to its trailing-slash URL and shares its cover @smoke', async ({
    projectPage,
  }) => {
    const head = await ServedHtml.of(await projectPage.openProject('seed-featured-project'));
    const url = `${SITE_URL}/project/seed-featured-project/`;

    expect(head.documentLanguage()).toBe('en');
    expect(head.canonicalUrl()).toBe(url);
    expect(head.meta('og:url')).toBe(url);
    expect(head.meta('og:title')).toBe('Seed featured project | Edgar Ferreira');
    expect(head.meta('og:description')).toBe(
      'A featured fixture project with demo and code links.',
    );
    expect(head.meta('og:image')).toBe(`${SITE_URL}/uploads/seed-featured-project.png`);
    expect(head.meta('twitter:card')).toBe('summary_large_image');
    expect(head.meta('twitter:title')).toBe('Seed featured project | Edgar Ferreira');
    expect(head.meta('twitter:description')).toBe(
      'A featured fixture project with demo and code links.',
    );
  });

  test('an article page is an Open Graph article with its cover and publication date', async ({
    articlePage,
  }) => {
    const head = await ServedHtml.of(await articlePage.openArticle('seed-article-with-markdown'));
    const url = `${SITE_URL}/article/seed-article-with-markdown/`;

    expect(head.canonicalUrl()).toBe(url);
    expect(head.meta('og:type')).toBe('article');
    expect(head.meta('og:url')).toBe(url);
    expect(head.meta('og:image')).toBe(`${SITE_URL}/uploads/seed-article-with-markdown.png`);
    expect(head.meta('og:image:alt')).toBe('Cover of the seed article');
    expect(head.meta('article:published_time')).toBe('2025-12-19');
  });

  test('an article without a cover falls back to the portrait image', async ({ articlePage }) => {
    const head = await ServedHtml.of(await articlePage.openArticle('seed-another-article'));

    expect(head.meta('og:image')).toBe(`${SITE_URL}/uploads/seed-portrait.png`);
    expect(head.meta('twitter:image')).toBe(`${SITE_URL}/uploads/seed-portrait.png`);
  });
});
