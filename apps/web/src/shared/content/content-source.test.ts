import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { NotFoundError, ValidationError } from '@portfolio/contracts';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { z } from 'zod';
import { type ContentSource, createContentSource } from './content-source';

const projectSchema = z.strictObject({ title: z.string(), completedOn: z.string().optional() });

let root: string;
let source: ContentSource;

async function write(relativePath: string, text: string) {
  const filePath = path.join(root, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, text);
}

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'content-'));
  source = createContentSource(root);
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('listEntries', () => {
  test('returns every Markdown entry of a folder, sorted by slug, with its body', async () => {
    await write('projects/b-project.md', '---\ntitle: B\n---\nBody of B\n');
    await write('projects/a-project.md', '---\ntitle: A\n---\n');

    const entries = await source.listEntries('projects', projectSchema);

    expect(entries.map((entry) => entry.slug)).toEqual(['a-project', 'b-project']);
    expect(entries[1]).toEqual({ slug: 'b-project', data: { title: 'B' }, body: 'Body of B\n' });
  });

  test('keeps YAML dates as strings', async () => {
    await write('projects/dated.md', '---\ntitle: Dated\ncompletedOn: 2024-05-01\n---\n');

    const [entry] = await source.listEntries('projects', projectSchema);

    expect(entry?.data.completedOn).toBe('2024-05-01');
  });

  test('reads data-only YAML entries', async () => {
    await write('projects/data-only.yml', 'title: Data only\n');

    const [entry] = await source.listEntries('projects', projectSchema);

    expect(entry).toEqual({ slug: 'data-only', data: { title: 'Data only' }, body: '' });
  });

  test('returns an empty list when the folder does not exist yet', async () => {
    expect(await source.listEntries('projects', projectSchema)).toEqual([]);
  });

  test('throws a ValidationError naming the file when an entry is invalid', async () => {
    await write('projects/broken.md', '---\ntitle: 42\n---\n');

    await expect(source.listEntries('projects', projectSchema)).rejects.toThrow(ValidationError);
    await expect(source.listEntries('projects', projectSchema)).rejects.toThrow(
      'projects/broken.md',
    );
  });
});

describe('findEntry', () => {
  test('returns the entry with that slug', async () => {
    await write('projects/one.md', '---\ntitle: One\n---\n');

    const entry = await source.findEntry('projects', 'one', projectSchema);

    expect(entry?.data.title).toBe('One');
  });

  test('returns null for a missing slug', async () => {
    expect(await source.findEntry('projects', 'missing', projectSchema)).toBeNull();
  });

  test('returns null for a slug that tries to leave the folder', async () => {
    await write('secret.md', '---\ntitle: Secret\n---\n');

    expect(await source.findEntry('projects', '../secret', projectSchema)).toBeNull();
  });
});

describe('getFile', () => {
  const settingsSchema = z.strictObject({ siteName: z.string() });

  test('parses a YAML settings file', async () => {
    await write('settings/site.yml', 'siteName: Edgar Ferreira\n');

    expect(await source.getFile('settings/site.yml', settingsSchema)).toEqual({
      siteName: 'Edgar Ferreira',
    });
  });

  test('throws NotFoundError when the file is missing', async () => {
    await expect(source.getFile('settings/site.yml', settingsSchema)).rejects.toThrow(
      NotFoundError,
    );
  });

  test('throws ValidationError when the file is invalid', async () => {
    await write('settings/site.yml', 'siteName: [not, a, string]\n');

    await expect(source.getFile('settings/site.yml', settingsSchema)).rejects.toThrow(
      ValidationError,
    );
  });
});
