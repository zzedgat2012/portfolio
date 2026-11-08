import { z } from 'zod';

const sitePathSchema = z.string().regex(/^\/\S*$/, 'Must be a site path starting with /');

export const redirectSchema = z
  .strictObject({
    from: sitePathSchema,
    to: z.union([sitePathSchema, z.url({ protocol: /^https?$/ })]),
    status: z.union([z.literal(301), z.literal(302)]),
  })
  .refine((redirect) => redirect.from !== redirect.to, {
    message: 'A redirect cannot point to itself',
    path: ['to'],
  });

/** `content/settings/redirects.yml`: turned into `out/_redirects` at build time (D4). */
export const redirectsFileSchema = z.strictObject({
  redirects: z
    .array(redirectSchema)
    .default([])
    .refine((redirects) => new Set(redirects.map((r) => r.from)).size === redirects.length, {
      message: 'Each "from" path may appear only once',
    }),
});

export type RedirectsFile = z.infer<typeof redirectsFileSchema>;
