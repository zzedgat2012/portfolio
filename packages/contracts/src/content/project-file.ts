import { z } from 'zod';
import {
  httpUrlSchema,
  legacyWpIdSchema,
  slugListSchema,
  stringListSchema,
  textSchema,
  uploadPathSchema,
} from './fields';

/** Frontmatter of `content/projects/<slug>.md`; the Markdown body is the overview. */
export const projectFileSchema = z.strictObject({
  title: textSchema(120),
  summary: textSchema(280),
  coverImage: uploadPathSchema,
  coverImageAlt: textSchema(200),
  /** Slugs of `content/tags/<slug>.yml`. */
  tags: slugListSchema,
  technologies: stringListSchema(80),
  features: stringListSchema(200),
  demoUrl: httpUrlSchema.optional(),
  codeUrl: httpUrlSchema.optional(),
  sortOrder: z.number().int().min(0).max(999),
  isFeatured: z.boolean().default(false),
  legacyWpId: legacyWpIdSchema,
});

export type ProjectFile = z.infer<typeof projectFileSchema>;
