import { z } from 'zod';
import { textSchema } from './fields';

/** `content/tags/<slug>.yml`: one tag shared by projects and articles. */
export const tagFileSchema = z.strictObject({
  name: textSchema(60),
});

export type TagFile = z.infer<typeof tagFileSchema>;
