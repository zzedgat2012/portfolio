import 'server-only';
import path from 'node:path';
import { createContentSource } from './content-source';

/** Content root: `CONTENT_DIR` (relative to apps/web), default the repo-root `content/`. */
export const CONTENT_DIR = path.resolve(process.cwd(), process.env.CONTENT_DIR ?? '../../content');

export const contentSource = createContentSource(CONTENT_DIR);

export type { ContentSource, Entry } from './content-source';
