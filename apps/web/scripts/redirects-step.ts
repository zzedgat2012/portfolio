import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { contentModel } from '@portfolio/contracts';
import { toRedirects } from '../src/features/redirects/content/redirect-mapper';
import type { Redirect } from '../src/features/redirects/model';
// Relative imports, not `@/features/redirects`: its query goes through `@/shared/content`,
// which imports `server-only` and only loads inside a React Server Components build.
import { resolveContentDir } from '../src/shared/content/content-dir';
import { createContentSource } from '../src/shared/content/content-source';
import type { PostbuildStep } from './postbuild-steps';

/** Cloudflare's `_redirects` format: one `<from> <to> <status>` line per redirect. */
export function serializeRedirects(redirects: readonly Redirect[]): string {
  return redirects.map(({ from, to, status }) => `${from} ${to} ${status}\n`).join('');
}

/**
 * D4 step 1: writes `out/_redirects` from `settings/redirects.yml` of `contentDir`, validated
 * with the contracts schema (an invalid or missing file fails the build).
 */
export function createRedirectsStep(contentDir: string): PostbuildStep {
  return {
    name: 'redirects',
    run: async ({ outDir }) => {
      const { path: filePath, schema } = contentModel.files['settings/redirects'];
      const file = await createContentSource(contentDir).getFile(filePath, schema);
      await writeFile(path.join(outDir, '_redirects'), serializeRedirects(toRedirects(file)));
    },
  };
}

export const redirectsStep: PostbuildStep = createRedirectsStep(resolveContentDir());
