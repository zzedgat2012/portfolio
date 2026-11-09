import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, test } from 'vitest';
import { createRedirectsStep, serializeRedirects } from './redirects-step';

const FIXTURE_CONTENT = fileURLToPath(new URL('../e2e/content', import.meta.url));

describe('[story 3.1] serializeRedirects', () => {
  test('writes one "from to status" line per redirect, in file order (Cloudflare format)', () => {
    expect(
      serializeRedirects([
        { from: '/feed/', to: '/feed.xml', status: 301 },
        { from: '/old/', to: 'https://example.com/new/', status: 302 },
      ]),
    ).toBe('/feed/ /feed.xml 301\n/old/ https://example.com/new/ 302\n');
  });

  test('writes an empty file when there is no redirect', () => {
    expect(serializeRedirects([])).toBe('');
  });
});

describe('[story 3.1] redirectsStep', () => {
  let outDir: string | null = null;

  afterEach(async () => {
    if (outDir) {
      await rm(outDir, { recursive: true, force: true });
    }
  });

  test('writes out/_redirects from settings/redirects.yml of the content directory', async () => {
    outDir = await mkdtemp(path.join(tmpdir(), 'redirects-step-'));

    await createRedirectsStep(FIXTURE_CONTENT).run({ outDir });

    expect(await readFile(path.join(outDir, '_redirects'), 'utf8')).toBe(
      [
        '/feed/ /feed.xml 301',
        '/wp-sitemap.xml /sitemap.xml 301',
        '/seed-temporary/ /project/seed-featured-project/ 302',
        '',
      ].join('\n'),
    );
  });

  test('fails when the content directory has no redirects file', async () => {
    outDir = await mkdtemp(path.join(tmpdir(), 'redirects-step-'));

    await expect(createRedirectsStep(outDir).run({ outDir })).rejects.toThrow(
      'settings/redirects.yml',
    );
  });
});
