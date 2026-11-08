import type { z } from 'zod';
import { articleFileSchema } from './article-file';
import { profileFileSchema } from './profile-file';
import { projectFileSchema } from './project-file';
import { redirectsFileSchema } from './redirects-file';
import { siteSettingsFileSchema } from './site-settings-file';
import { tagFileSchema } from './tag-file';

export type FileModel = {
  /** Path relative to the content root, e.g. `settings/site.yml`. */
  readonly path: string;
  readonly schema: z.ZodObject;
};

/** A field holding slug(s) of entries of another folder collection (Decap relation widget). */
export type RelationModel = {
  readonly field: string;
  readonly collection: string;
};

export type FolderModel = {
  /** Entry file extension: `md` (frontmatter + body) or `yml` (data only). */
  readonly extension: 'md' | 'yml';
  readonly schema: z.ZodObject;
  readonly relations?: readonly RelationModel[];
};

const TAGS_RELATION = [{ field: 'tags', collection: 'tags' }] as const;

/**
 * Every Decap collection and the Zod schema that validates its files (architecture D2).
 * File collections are keyed `<collection>/<file>`; folder collections by collection name
 * (also the folder under `content/`). Shared by the web app and the migrator.
 */
export const contentModel = {
  files: {
    'settings/site': { path: 'settings/site.yml', schema: siteSettingsFileSchema },
    'settings/profile': { path: 'settings/profile.yml', schema: profileFileSchema },
    'settings/redirects': { path: 'settings/redirects.yml', schema: redirectsFileSchema },
  } satisfies Record<string, FileModel>,
  folders: {
    projects: { extension: 'md', schema: projectFileSchema, relations: TAGS_RELATION },
    articles: { extension: 'md', schema: articleFileSchema, relations: TAGS_RELATION },
    tags: { extension: 'yml', schema: tagFileSchema },
  } satisfies Record<string, FolderModel>,
} as const;

export type ContentModel = {
  readonly files: Readonly<Record<string, FileModel>>;
  readonly folders: Readonly<Record<string, FolderModel>>;
};
