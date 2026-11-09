import { buildArticlePath, listArticles } from '@/features/articles';
import { buildRssFeed, FEED_PATH } from '@/features/seo';
import { getSiteSettings } from '@/features/settings';

export const dynamic = 'force-static';

/** `/feed.xml` (story 3.1): RSS 2.0 of every article, newest first. Exported as a static file. */
// biome-ignore lint/style/useNamingConvention: Next.js route handlers are named after the HTTP method.
export async function GET(): Promise<Response> {
  const [settings, articles] = await Promise.all([getSiteSettings(), listArticles()]);
  const xml = buildRssFeed({
    title: settings.siteName,
    description: settings.description ?? settings.siteName,
    siteUrl: settings.siteUrl,
    feedPath: FEED_PATH,
    items: articles.map((article) => ({
      title: article.title,
      path: buildArticlePath(article.slug),
      summary: article.summary,
      publishedOn: article.publishedOn,
    })),
  });
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
