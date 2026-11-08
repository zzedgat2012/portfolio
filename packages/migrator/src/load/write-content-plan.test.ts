import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { readSnapshotDir } from '../source';
import { buildContentPlan } from '../transform';
import { writeContentPlan } from './write-content-plan';

const FIXTURES_DIR = fileURLToPath(new URL('../../fixtures', import.meta.url));
const plan = buildContentPlan(await readSnapshotDir(FIXTURES_DIR));

let root: string;
let contentDir: string;
let uploadsDir: string;

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'migrator-'));
  contentDir = path.join(root, 'content');
  uploadsDir = path.join(root, 'uploads');
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

const fakeDownload = () =>
  vi.fn(async (url: string) => new TextEncoder().encode(`bytes of ${url}`));

/** Every file under `dir` with its contents, for before/after comparisons. */
async function readTree(dir: string): Promise<Record<string, string>> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile());
  const pairs = await Promise.all(
    files.map(async (entry) => {
      const file = path.join(entry.parentPath, entry.name);
      return [path.relative(dir, file), await readFile(file, 'utf8')] as const;
    }),
  );
  return Object.fromEntries(pairs.sort(([a], [b]) => a.localeCompare(b)));
}

describe('[story 1.2] writeContentPlan', () => {
  test('writes every entry, settings file and media item', async () => {
    const download = fakeDownload();
    const report = await writeContentPlan(plan, { contentDir, uploadsDir, download });

    const tree = await readTree(root);
    expect(Object.keys(tree).filter((file) => file.startsWith('content/projects/'))).toHaveLength(
      3,
    );
    expect(Object.keys(tree).filter((file) => file.startsWith('content/articles/'))).toHaveLength(
      5,
    );
    expect(Object.keys(tree).filter((file) => file.startsWith('content/tags/'))).toHaveLength(26);
    expect(Object.keys(tree).filter((file) => file.startsWith('uploads/'))).toHaveLength(6);
    expect(tree['content/settings/profile.yml']).toBeDefined();
    expect(tree['content/settings/site.yml']).toBeDefined();
    expect(tree['content/settings/redirects.yml']).toBeDefined();
    expect(download).toHaveBeenCalledTimes(6);
    expect(report.unchanged).toEqual([]);
    expect(report.created.length).toBe(3 + 5 + 26 + 3 + 6);
  });

  test('is idempotent: a second run changes nothing and downloads nothing', async () => {
    await writeContentPlan(plan, { contentDir, uploadsDir, download: fakeDownload() });
    const before = await readTree(root);

    const download = fakeDownload();
    const report = await writeContentPlan(plan, { contentDir, uploadsDir, download });

    expect(await readTree(root)).toEqual(before);
    expect(download).not.toHaveBeenCalled();
    expect(report.created).toEqual([]);
    expect(report.updated).toEqual([]);
    expect(report.removed).toEqual([]);
  });

  test('matches entries by legacyWpId and replaces a file whose slug changed', async () => {
    await mkdir(path.join(contentDir, 'projects'), { recursive: true });
    await writeFile(
      path.join(contentDir, 'projects', 'old-kafka-slug.md'),
      '---\ntitle: Old\nlegacyWpId: 8\n---\nOld body\n',
    );
    await writeFile(
      path.join(contentDir, 'projects', 'hand-written.md'),
      '---\ntitle: Kept\n---\nNot from WordPress\n',
    );

    const report = await writeContentPlan(plan, {
      contentDir,
      uploadsDir,
      download: fakeDownload(),
    });

    const projects = (await readdir(path.join(contentDir, 'projects'))).sort();
    expect(projects).toEqual([
      'ecommerce-platform.md',
      'hand-written.md',
      'kafka-golang-microservices.md',
      'task-management.md',
    ]);
    expect(report.removed).toEqual(['projects/old-kafka-slug.md']);
  });

  test('keeps existing redirects and adds the required ones only once', async () => {
    await mkdir(path.join(contentDir, 'settings'), { recursive: true });
    await writeFile(
      path.join(contentDir, 'settings', 'redirects.yml'),
      'redirects:\n  - from: /feed/\n    to: /feed.xml\n    status: 301\n  - from: /old/\n    to: /\n    status: 302\n',
    );

    await writeContentPlan(plan, { contentDir, uploadsDir, download: fakeDownload() });

    const redirects = parseYaml(
      await readFile(path.join(contentDir, 'settings', 'redirects.yml'), 'utf8'),
    );
    expect(redirects).toEqual({
      redirects: [
        { from: '/feed/', to: '/feed.xml', status: 301 },
        { from: '/old/', to: '/', status: 302 },
        { from: '/wp-sitemap.xml', to: '/sitemap.xml', status: 301 },
      ],
    });
  });
});
