import { expect, test } from '../fixtures';

const SLUG = 'seed-article-with-markdown';
// The fixture's hello.js block; `$` is split off so the JS template placeholder stays literal.
const HELLO_JS = ['export function hello(name) {', '  return `Hello, $' + '{name}!`;', '}'].join(
  '\n',
);

test.describe('[story 2.4] Article body', () => {
  test('renders headings, lists, a blockquote, inline code and a link from Markdown @smoke', async ({
    articlePage,
  }) => {
    await articlePage.openArticle(SLUG);
    const { body } = articlePage;

    await expect(body.getByRole('heading', { level: 2, name: 'Introduction' })).toBeVisible();
    await expect(body.getByRole('heading', { level: 3, name: 'A list' })).toBeVisible();
    await expect(body.getByRole('list').first().getByRole('listitem')).toHaveText([
      'First item with inline code',
      'Second item with a link',
    ]);
    await expect(body.getByRole('list').nth(1).getByRole('listitem')).toHaveText([
      'Step one',
      'Step two',
    ]);
    await expect(body.getByRole('blockquote')).toHaveText('A blockquote with a short remark.');
    await expect(body.getByRole('code').filter({ hasText: /^inline code$/ })).toBeVisible();
    await expect(body.getByRole('link', { name: 'link' })).toHaveAttribute(
      'href',
      'https://example.com',
    );
    await expect(body.getByText('1. An escaped number that stays a paragraph.')).toBeVisible();
    await expect(body.getByText('## Introduction')).toHaveCount(0);
  });

  test('shows the filename from the title= meta above a fenced code block @smoke', async ({
    articlePage,
  }) => {
    await articlePage.openArticle(SLUG);

    const codeBlock = articlePage.codeBlock('hello.js');
    await expect(codeBlock).toBeVisible();
    await expect(codeBlock.getByText('hello.js', { exact: true })).toBeVisible();
    await expect(codeBlock).toContainText('export function hello(name) {');
  });

  test('renders every fenced block, with or without a language, as a code block', async ({
    articlePage,
  }) => {
    await articlePage.openArticle(SLUG);

    await expect(articlePage.codeBlock()).toHaveCount(3);
    await expect(articlePage.codeBlock().nth(1)).toContainText('select 1 from dual;');
    await expect(articlePage.codeBlock().nth(2)).toContainText('*app.example.com/*');
  });

  // Highlighting happens at build time: the served HTML already carries Shiki's token colours.
  test('serves code already highlighted in the HTML', async ({ articlePage }) => {
    const response = await articlePage.openArticle(SLUG);
    const html = (await response?.text()) ?? '';

    expect(html).toContain('data-theme="dark-plus"');
    expect(html).toMatch(/<span style="color:#[0-9A-Fa-f]{6}">export<\/span>/);
  });

  test('copies the code of a block with its Copy button @smoke', async ({
    context,
    articlePage,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await articlePage.installClock();
    await articlePage.openArticle(SLUG);
    const codeBlock = articlePage.codeBlock('hello.js');
    const copyButton = articlePage.copyCodeButton(codeBlock);
    await expect(copyButton).toHaveAccessibleName('Copy code');
    await articlePage.pauseClock();

    await articlePage.copyCode(codeBlock);

    expect(await articlePage.readClipboard()).toBe(HELLO_JS);
    await expect(copyButton).toHaveText('Copied');
    await articlePage.advanceClock(2000);
    await expect(copyButton).toHaveText('Copy code');
  });
});
