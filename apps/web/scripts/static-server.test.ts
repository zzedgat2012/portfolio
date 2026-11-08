import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { resolveStaticFilePath, startStaticServer, toContentType } from './static-server';

const ROOT = path.resolve('/srv/out');

describe('[story 2.5] toContentType', () => {
  test.each([
    ['index.html', 'text/html; charset=utf-8'],
    ['app.js', 'text/javascript; charset=utf-8'],
    ['style.CSS', 'text/css; charset=utf-8'],
    ['font.woff2', 'font/woff2'],
    ['photo.webp', 'image/webp'],
    ['icon.svg', 'image/svg+xml'],
    ['cv.pdf', 'application/pdf'],
    ['unknown.bin', 'application/octet-stream'],
  ])('%s is served as %s', (file, type) => {
    expect(toContentType(file)).toBe(type);
  });
});

describe('[story 2.5] resolveStaticFilePath', () => {
  test('maps a trailing-slash route to its index.html', () => {
    expect(resolveStaticFilePath(ROOT, '/cv/')).toBe(path.join(ROOT, 'cv/index.html'));
    expect(resolveStaticFilePath(ROOT, '/')).toBe(path.join(ROOT, 'index.html'));
  });

  test('maps a file URL to the file and ignores the query string', () => {
    expect(resolveStaticFilePath(ROOT, '/_next/static/a.css?v=1')).toBe(
      path.join(ROOT, '_next/static/a.css'),
    );
  });

  test('decodes percent-encoded segments', () => {
    expect(resolveStaticFilePath(ROOT, '/uploads/my%20photo.png')).toBe(
      path.join(ROOT, 'uploads/my photo.png'),
    );
  });

  test('never resolves outside the root', () => {
    expect(resolveStaticFilePath(ROOT, '/../secret.txt')).toBeNull();
    expect(resolveStaticFilePath(ROOT, '/%2e%2e/secret.txt')).toBeNull();
    expect(resolveStaticFilePath(ROOT, '/a/%2e%2e/%2e%2e/secret.txt')).toBeNull();
  });

  test('rejects malformed percent-encoding', () => {
    expect(resolveStaticFilePath(ROOT, '/%E0%A4%A')).toBeNull();
  });
});

describe('[story 2.5] startStaticServer', () => {
  let rootDir = '';

  beforeAll(async () => {
    rootDir = await mkdtemp(path.join(tmpdir(), 'static-server-'));
    await mkdir(path.join(rootDir, 'cv'));
    await writeFile(path.join(rootDir, 'cv/index.html'), '<h1>CV</h1>');
  });

  afterAll(async () => {
    await rm(rootDir, { recursive: true, force: true });
  });

  test('serves files from the root on an ephemeral 127.0.0.1 port, 404 otherwise', async () => {
    const server = await startStaticServer(rootDir);
    try {
      expect(server.origin).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);

      const page = await fetch(`${server.origin}/cv/`);
      expect(page.status).toBe(200);
      expect(page.headers.get('content-type')).toBe('text/html; charset=utf-8');
      expect(await page.text()).toBe('<h1>CV</h1>');

      const directory = await fetch(`${server.origin}/cv`);
      expect(directory.status).toBe(200);

      const missing = await fetch(`${server.origin}/missing.css`);
      expect(missing.status).toBe(404);
    } finally {
      await server.close();
    }
  });
});
