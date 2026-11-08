import type { z } from 'zod';
import { siteSettingsFileSchema } from './site-settings-file';

export type FileModel = {
  /** Path relative to the content root, e.g. `settings/site.yml`. */
  readonly path: string;
  readonly schema: z.ZodObject;
};

export type FolderModel = {
  /** Entry file extension: `md` (frontmatter + body) or `yml` (data only). */
  readonly extension: 'md' | 'yml';
  readonly schema: z.ZodObject;
};

/**
 * Every Decap collection and the Zod schema that validates its files.
 * File collections are keyed `<collection>/<file>`; folder collections by collection name
 * (also the folder under `content/`). Shared by the web app and the migrator.
 */
export const contentModel = {
  files: {
    'settings/site': { path: 'settings/site.yml', schema: siteSettingsFileSchema },
  } satisfies Record<string, FileModel>,
  folders: {} satisfies Record<string, FolderModel>,
} as const;

export type ContentModel = {
  readonly files: Readonly<Record<string, FileModel>>;
  readonly folders: Readonly<Record<string, FolderModel>>;
};
