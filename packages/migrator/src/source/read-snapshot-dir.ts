import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import {
  buildPageFileName,
  type RawSnapshot,
  toWpSnapshot,
  WP_REST_ENDPOINTS,
  type WpRestName,
  type WpSnapshot,
} from './wp-schemas';

const slugsSchema = z.array(z.looseObject({ slug: z.string() }));

/**
 * Reads a recorded snapshot: `rest/<endpoint>.json` and `html/home.html`,
 * `html/project-<slug>.html`, `html/article-<slug>.html` (the layout of `fixtures/`).
 */
export async function readSnapshotDir(dir: string): Promise<WpSnapshot> {
  const readText = (relativePath: string) => readFile(path.join(dir, relativePath), 'utf8');
  const names = Object.keys(WP_REST_ENDPOINTS) as WpRestName[];
  const payloads = await Promise.all(
    names.map(async (name) => [name, JSON.parse(await readText(`rest/${name}.json`))] as const),
  );
  const rest = Object.fromEntries(payloads) as Record<WpRestName, unknown>;

  const readPages = async (kind: 'project' | 'article', payload: unknown) =>
    Object.fromEntries(
      await Promise.all(
        slugsSchema
          .parse(payload)
          .map(
            async ({ slug }) =>
              [slug, await readText(`html/${buildPageFileName(kind, slug)}.html`)] as const,
          ),
      ),
    );

  const raw: RawSnapshot = {
    rest,
    homeHtml: await readText('html/home.html'),
    projectHtml: await readPages('project', rest.project),
    articleHtml: await readPages('article', rest.posts),
  };
  return toWpSnapshot(raw);
}
