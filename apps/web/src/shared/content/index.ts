import 'server-only';
import { resolveContentDir } from './content-dir';
import { createContentSource } from './content-source';

/** Content root: `CONTENT_DIR` (relative to apps/web), default the repo-root `content/`. */
export const CONTENT_DIR = resolveContentDir();

export const contentSource = createContentSource(CONTENT_DIR);

export type { ContentSource, Entry } from './content-source';
