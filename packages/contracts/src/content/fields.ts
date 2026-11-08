import { z } from 'zod';
import { SLUG_PATTERN } from '../branded';

/**
 * Field schemas shared by the content files. Each one mirrors a Decap widget/pattern in
 * `apps/web/public/admin/config.yml`.
 */

/** A relation value: the slug of another entry (Decap relation widget, `value_field: "{{slug}}"`). */
export const slugSchema = z.string().regex(SLUG_PATTERN, 'Must be a kebab-case slug');

/** A media path written by Decap's image widget (`public_folder: /uploads`). */
export const uploadPathSchema = z.string().regex(/^\/uploads\/\S+$/, 'Must start with /uploads/');

/** An absolute http(s) URL. */
export const httpUrlSchema = z.url({ protocol: /^https?$/ });

/** A non-empty single-line string of at most `max` characters. */
export function textSchema(max: number) {
  return z.string().trim().min(1).max(max);
}

/** A calendar month, `YYYY-MM` (experience ranges). */
export const yearMonthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Must be YYYY-MM');

/** Migration bookkeeping: the WordPress post id. Hidden in Decap; mappers drop it. */
export const legacyWpIdSchema = z.number().int().positive().optional();

/** Relation slugs; an absent list is an empty one. */
export const slugListSchema = z.array(slugSchema).default([]);

/** A list of short strings; an absent list is an empty one. */
export function stringListSchema(max: number) {
  return z.array(textSchema(max)).default([]);
}
