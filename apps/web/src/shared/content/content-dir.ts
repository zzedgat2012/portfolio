import path from 'node:path';

/**
 * Content root: `CONTENT_DIR` (relative to apps/web), default the repo-root `content/`.
 * Dependency-free so `scripts/postbuild.ts` (plain Node via tsx) resolves it like Next.js does.
 */
export function resolveContentDir(
  env: Readonly<Record<string, string | undefined>> = process.env,
  cwd: string = process.cwd(),
): string {
  return path.resolve(cwd, env.CONTENT_DIR ?? '../../content');
}
