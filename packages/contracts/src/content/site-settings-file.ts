import { z } from 'zod';

/**
 * `content/settings/site.yml`, edited through the Decap "Settings › Site" file collection.
 * Mirrors `apps/web/public/admin/config.yml`; the parity test fails if they drift.
 */
export const siteSettingsFileSchema = z.strictObject({
  siteName: z.string().min(1).max(80),
  description: z.string().max(160).optional(),
});

export type SiteSettingsFile = z.infer<typeof siteSettingsFileSchema>;
