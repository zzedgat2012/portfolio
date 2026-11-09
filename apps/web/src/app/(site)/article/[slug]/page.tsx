import type { Metadata } from 'next';
import {
  ArticleDetail,
  buildArticlePath,
  getArticleBySlug,
  listArticles,
} from '@/features/articles';
import { getProfile } from '@/features/profile';
import { buildArticleJsonLd } from '@/features/seo';
import { getSiteSettings } from '@/features/settings';
import { buildAbsoluteUrl, buildPageMetadata } from '@/shared/lib';
import { JsonLd, ReadingProgress } from '@/shared/ui';

type ArticleRouteProps = { params: Promise<{ slug: string }> };

/** Unknown slugs are not generated, so they 404 (the export's 404.html). */
export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return (await listArticles()).map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticleRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const [article, profile, settings] = await Promise.all([
    getArticleBySlug(slug),
    getProfile(),
    getSiteSettings(),
  ]);
  return buildPageMetadata({
    title: article.title,
    description: article.summary,
    siteName: settings.siteName,
    siteUrl: settings.siteUrl,
    path: buildArticlePath(slug),
    // Articles without a cover share the author's portrait.
    image: article.coverImage ?? profile.portrait,
    publishedOn: article.publishedOn,
  });
}

/** `/article/<slug>/` (architecture D1). */
export default async function ArticleRoute({ params }: ArticleRouteProps) {
  const { slug } = await params;
  const [article, profile, settings] = await Promise.all([
    getArticleBySlug(slug),
    getProfile(),
    getSiteSettings(),
  ]);
  return (
    <>
      <JsonLd data={buildArticleJsonLd(article, profile, settings.siteUrl)} />
      <ReadingProgress />
      <ArticleDetail
        article={article}
        author={profile}
        canonicalUrl={buildAbsoluteUrl(settings.siteUrl, buildArticlePath(slug))}
      />
    </>
  );
}
