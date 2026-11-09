import { buildArticlePath } from '@/features/articles';
import { buildProjectPath } from '@/features/projects';
import { buildAbsoluteUrl } from '@/shared/lib';
import { HOME_PATH } from './seo-paths';

export type SitemapEntry = {
  url: string;
  /** `YYYY-MM-DD`. */
  lastModified: string;
};

export type SitemapInput = {
  siteUrl: string;
  /** Build date (`YYYY-MM-DD`): last change of pages that have no date of their own. */
  builtOn: string;
  projects: readonly { slug: string }[];
  articles: readonly { slug: string; publishedOn: string }[];
};

/**
 * Every indexable URL (story 3.1): `/`, each project, each article. `/cv/` is `noindex` and left
 * out. The content model has no "updated on" field, so only articles carry a real date.
 */
export function buildSitemapEntries(input: SitemapInput): SitemapEntry[] {
  const { siteUrl, builtOn, projects, articles } = input;
  return [
    { url: buildAbsoluteUrl(siteUrl, HOME_PATH), lastModified: builtOn },
    ...projects.map((project) => ({
      url: buildAbsoluteUrl(siteUrl, buildProjectPath(project.slug)),
      lastModified: builtOn,
    })),
    ...articles.map((article) => ({
      url: buildAbsoluteUrl(siteUrl, buildArticlePath(article.slug)),
      lastModified: article.publishedOn,
    })),
  ];
}
