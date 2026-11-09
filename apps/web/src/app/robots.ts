import type { MetadataRoute } from 'next';
import { SITEMAP_PATH } from '@/features/seo';
import { getSiteSettings } from '@/features/settings';
import { buildAbsoluteUrl } from '@/shared/lib';

export const dynamic = 'force-static';

/**
 * `/robots.txt` (story 3.1): every crawler may crawl everything. `/cv/` is not disallowed on
 * purpose: crawlers must fetch it to read its `noindex`.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: buildAbsoluteUrl(settings.siteUrl, SITEMAP_PATH),
  };
}
