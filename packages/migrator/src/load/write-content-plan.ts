import { mkdir, readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { redirectsFileSchema, ValidationError } from '@portfolio/contracts';
import { parse as parseYaml } from 'yaml';
import { z } from 'zod';
import { readFrontmatter, toYamlDocument } from '../serialize';
import type { ContentPlan, EntryCollection, PlannedEntry } from '../transform';

export type ContentLoadOptions = {
  /** The `content/` folder of the repository. */
  contentDir: string;
  /** `apps/web/public/uploads`. */
  uploadsDir: string;
  /** Downloads one media file; only called for files that are not stored yet. */
  download: (url: string) => Promise<Uint8Array>;
};

/** Paths relative to `contentDir` (entries, settings) or `uploads/<file>` (media). */
export type LoadReport = {
  created: string[];
  updated: string[];
  unchanged: string[];
  removed: string[];
};

const REDIRECTS_PATH = 'settings/redirects.yml';
const legacyIdSchema = z.looseObject({ legacyWpId: z.number().int() });

async function readOptional(file: string): Promise<string | null> {
  try {
    return await readFile(file, 'utf8');
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function exists(file: string): Promise<boolean> {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

/** Existing files of a folder collection by the legacyWpId they carry. */
async function indexByLegacyWpId(folder: string): Promise<Map<number, string>> {
  const files = (await exists(folder)) ? await readdir(folder) : [];
  const index = new Map<number, string>();
  for (const file of files.sort()) {
    const contents = await readFile(path.join(folder, file), 'utf8');
    const data = file.endsWith('.md') ? readFrontmatter(contents) : parseYaml(contents);
    const parsed = legacyIdSchema.safeParse(data);
    if (parsed.success) {
      index.set(parsed.data.legacyWpId, file);
    }
  }
  return index;
}

/**
 * Writes a content plan, idempotently: files are only written when their contents change,
 * entries are matched by `legacyWpId` (a WordPress record whose slug changed replaces its old
 * file), media already stored are not downloaded again, and existing redirects are kept.
 * Load order: media, tags, projects, articles, settings (docs/conventions.md › Migration steps).
 */
export async function writeContentPlan(
  plan: ContentPlan,
  options: ContentLoadOptions,
): Promise<LoadReport> {
  const report: LoadReport = { created: [], updated: [], unchanged: [], removed: [] };

  async function writeIfChanged(relativePath: string, contents: string): Promise<void> {
    const file = path.join(options.contentDir, relativePath);
    const current = await readOptional(file);
    if (current === contents) {
      report.unchanged.push(relativePath);
      return;
    }
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, contents);
    (current === null ? report.created : report.updated).push(relativePath);
  }

  await mkdir(options.uploadsDir, { recursive: true });
  for (const item of plan.media) {
    const label = `uploads/${item.fileName}`;
    const file = path.join(options.uploadsDir, item.fileName);
    if (await exists(file)) {
      report.unchanged.push(label);
      continue;
    }
    await writeFile(file, await options.download(item.url));
    report.created.push(label);
  }

  const collections: EntryCollection[] = ['tags', 'projects', 'articles'];
  for (const collection of collections) {
    const folder = path.join(options.contentDir, collection);
    const byLegacyId = await indexByLegacyWpId(folder);
    const entries = plan.entries.filter((entry) => entry.collection === collection);
    for (const entry of entries) {
      await removeRenamedEntry(entry, byLegacyId, folder, report);
      await writeIfChanged(`${collection}/${entry.slug}.${entry.extension}`, entry.contents);
    }
  }

  for (const file of plan.files) {
    await writeIfChanged(file.path, file.contents);
  }
  await mergeRedirects(plan, options.contentDir, report, writeIfChanged);
  return report;
}

async function removeRenamedEntry(
  entry: PlannedEntry,
  byLegacyId: Map<number, string>,
  folder: string,
  report: LoadReport,
): Promise<void> {
  const fileName = `${entry.slug}.${entry.extension}`;
  const existing = entry.legacyWpId === undefined ? undefined : byLegacyId.get(entry.legacyWpId);
  if (existing !== undefined && existing !== fileName) {
    await unlink(path.join(folder, existing));
    report.removed.push(`${entry.collection}/${existing}`);
  }
}

async function mergeRedirects(
  plan: ContentPlan,
  contentDir: string,
  report: LoadReport,
  writeIfChanged: (relativePath: string, contents: string) => Promise<void>,
): Promise<void> {
  const current = await readOptional(path.join(contentDir, REDIRECTS_PATH));
  const parsed = redirectsFileSchema.safeParse(current === null ? {} : parseYaml(current));
  if (!parsed.success) {
    throw new ValidationError(`${REDIRECTS_PATH}: ${z.prettifyError(parsed.error)}`);
  }
  const known = new Set(parsed.data.redirects.map((redirect) => redirect.from));
  const missing = plan.redirects.filter((redirect) => !known.has(redirect.from));
  if (current !== null && missing.length === 0) {
    report.unchanged.push(REDIRECTS_PATH);
    return;
  }
  const merged = redirectsFileSchema.parse({ redirects: [...parsed.data.redirects, ...missing] });
  await writeIfChanged(REDIRECTS_PATH, toYamlDocument(merged));
}
