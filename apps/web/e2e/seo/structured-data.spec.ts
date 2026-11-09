import { expect, test } from '../fixtures';
import { ServedHtml } from '../pages/served-html';

const SITE_URL = 'https://edgar-ferreira.com';

test.describe('[story 3.1] Structured data (JSON-LD)', () => {
  test('the home page describes Edgar as a Person @smoke', async ({ page }) => {
    const head = await ServedHtml.of(await page.goto('/'));

    expect(head.structuredData()).toEqual([
      expect.objectContaining({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Edgar Ferreira',
        jobTitle: 'Product Engineer',
        url: `${SITE_URL}/`,
        image: `${SITE_URL}/uploads/seed-portrait.png`,
        sameAs: ['https://www.linkedin.com/in/seed', 'https://github.com/seed'],
      }),
    ]);
  });

  test('an article page describes an Article by Edgar', async ({ articlePage }) => {
    const head = await ServedHtml.of(await articlePage.openArticle('seed-article-with-markdown'));

    expect(head.structuredData()).toEqual([
      expect.objectContaining({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Seed article with every Markdown feature',
        description: 'A fixture article that uses headings, lists, quotes and code.',
        datePublished: '2025-12-19',
        url: `${SITE_URL}/article/seed-article-with-markdown/`,
        image: `${SITE_URL}/uploads/seed-article-with-markdown.png`,
        author: expect.objectContaining({ '@type': 'Person', name: 'Edgar Ferreira' }),
      }),
    ]);
  });

  test('a project page describes a CreativeWork by Edgar', async ({ projectPage }) => {
    const head = await ServedHtml.of(await projectPage.openProject('seed-featured-project'));

    expect(head.structuredData()).toEqual([
      expect.objectContaining({
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: 'Seed featured project',
        description: 'A featured fixture project with demo and code links.',
        url: `${SITE_URL}/project/seed-featured-project/`,
        image: `${SITE_URL}/uploads/seed-featured-project.png`,
        author: expect.objectContaining({ '@type': 'Person', name: 'Edgar Ferreira' }),
      }),
    ]);
  });
});
