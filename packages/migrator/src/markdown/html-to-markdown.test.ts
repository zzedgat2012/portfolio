import { describe, expect, test } from 'vitest';
import { toMarkdown } from './html-to-markdown';

describe('[story 1.2] toMarkdown', () => {
  test('converts headings, paragraphs, emphasis and lists to GitHub-flavoured Markdown', () => {
    const html =
      '<h2>Why This Stack?</h2>\n<h3>Golang</h3>\n<p>Fast <strong>and</strong> <em>simple</em>.</p>\n<ul>\n<li>One</li>\n<li>Two</li>\n</ul>';
    expect(toMarkdown(html)).toBe(
      '## Why This Stack?\n\n### Golang\n\nFast **and** _simple_.\n\n- One\n- Two',
    );
  });

  test('turns <pre><code class="language-x"> into a fenced block with that language', () => {
    const html = '<pre><code class="language-go">package main\n\nfunc main() {}</code></pre>';
    expect(toMarkdown(html)).toBe('```go\npackage main\n\nfunc main() {}\n```');
  });

  test('writes a fence without language when none is given or it is plaintext', () => {
    expect(toMarkdown('<pre><code>select 1;</code></pre>')).toBe('```\nselect 1;\n```');
    expect(toMarkdown('<pre><code class="language-plaintext">a -&gt; b</code></pre>')).toBe(
      '```\na -> b\n```',
    );
  });

  test('decodes HTML entities in text and code', () => {
    const html =
      '<p>We&#039;ll do it &#8211; now</p>\n<pre><code class="language-go">&quot;x&quot; &amp;y</code></pre>';
    expect(toMarkdown(html)).toBe('We\'ll do it – now\n\n```go\n"x" &y\n```');
  });

  test('keeps inline code and links', () => {
    expect(toMarkdown('<p>Use <code>fetch()</code> and <a href="https://x.dev/">x</a>.</p>')).toBe(
      'Use `fetch()` and [x](https://x.dev/).',
    );
  });

  test('returns an empty string for empty HTML', () => {
    expect(toMarkdown('  \n')).toBe('');
  });
});
