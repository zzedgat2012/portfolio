import type { MetadataRoute } from 'next';
import { listArticles } from '@/features/articles';
import { listProjects } from '@/features/projects';
import { buildSitemapEntries } from '@/features/seo';
import { getSiteSettings } from '@/features/settings';

export const dynamic = 'force-static';

/** `/sitemap.xml` (story 3.1): `/`, every project and article; `/cv/` stays out (noindex). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, projects, articles] = await Promise.all([
    getSiteSettings(),
    listProjects(),
    listArticles(),
  ]);
  return buildSitemapEntries({
    siteUrl: settings.siteUrl,
    builtOn: new Date().toISOString().slice(0, 10),
    projects,
    articles,
  });
}
