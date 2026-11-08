import { z } from 'zod';
import { legacyWpIdSchema, slugListSchema, textSchema, uploadPathSchema } from './fields';

/** Frontmatter of `content/articles/<slug>.md`; the Markdown body is the article. */
export const articleFileSchema = z
  .strictObject({
    title: textSchema(160),
    summary: textSchema(280),
    publishedOn: z.iso.date(),
    /** Slugs of `content/tags/<slug>.yml`. */
    tags: slugListSchema,
    coverImage: uploadPathSchema.optional(),
    coverImageAlt: textSchema(200).optional(),
    legacyWpId: legacyWpIdSchema,
  })
  .refine((file) => file.coverImage === undefined || file.coverImageAlt !== undefined, {
    message: 'A cover image needs coverImageAlt',
    path: ['coverImageAlt'],
  });

export type ArticleFile = z.infer<typeof articleFileSchema>;
