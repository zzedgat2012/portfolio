import type { Article } from '@/features/articles';
import { buildArticlePath } from '@/features/articles';
import type { Profile } from '@/features/profile';
import type { Project } from '@/features/projects';
import { buildProjectPath } from '@/features/projects';
import type { JsonLd } from '@/shared/lib';
import { buildAbsoluteUrl } from '@/shared/lib';
import { HOME_PATH } from './seo-paths';

const SCHEMA_ORG = 'https://schema.org';

type Author = Pick<Profile, 'name'>;

function buildAuthor(author: Author, siteUrl: string): JsonLd {
  return { '@type': 'Person', name: author.name, url: buildAbsoluteUrl(siteUrl, HOME_PATH) };
}

function isExternalWebLink(url: string, siteUrl: string): boolean {
  const origin = siteUrl.replace(/\/+$/, '');
  return (
    /^https?:\/\//.test(url) && url.replace(/\/+$/, '') !== origin && !url.startsWith(`${origin}/`)
  );
}

/** `Person` of the home page: the profile, with its external profiles as `sameAs`. */
export function buildPersonJsonLd(
  profile: Pick<Profile, 'name' | 'role' | 'heroTagline' | 'portrait' | 'links'>,
  siteUrl: string,
): JsonLd {
  return {
    '@context': SCHEMA_ORG,
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.role,
    description: profile.heroTagline,
    url: buildAbsoluteUrl(siteUrl, HOME_PATH),
    image: buildAbsoluteUrl(siteUrl, profile.portrait.src),
    sameAs: profile.links.map((link) => link.url).filter((url) => isExternalWebLink(url, siteUrl)),
  };
}

/** `Article` of an article page; without a cover, the author's portrait is the image. */
export function buildArticleJsonLd(
  article: Pick<Article, 'slug' | 'title' | 'summary' | 'publishedOn' | 'tags' | 'coverImage'>,
  author: Author & Pick<Profile, 'portrait'>,
  siteUrl: string,
): JsonLd {
  const url = buildAbsoluteUrl(siteUrl, buildArticlePath(article.slug));
  return {
    '@context': SCHEMA_ORG,
    '@type': 'Article',
    headline: article.title,
    description: article.summary,
    datePublished: article.publishedOn,
    url,
    mainEntityOfPage: url,
    image: buildAbsoluteUrl(siteUrl, (article.coverImage ?? author.portrait).src),
    keywords: article.tags.map((tag) => tag.name),
    author: buildAuthor(author, siteUrl),
  };
}

/** `CreativeWork` of a project page. */
export function buildProjectJsonLd(
  project: Pick<Project, 'slug' | 'title' | 'summary' | 'coverImage' | 'tags'>,
  author: Author,
  siteUrl: string,
): JsonLd {
  return {
    '@context': SCHEMA_ORG,
    '@type': 'CreativeWork',
    name: project.title,
    description: project.summary,
    url: buildAbsoluteUrl(siteUrl, buildProjectPath(project.slug)),
    image: buildAbsoluteUrl(siteUrl, project.coverImage.src),
    keywords: project.tags.map((tag) => tag.name),
    author: buildAuthor(author, siteUrl),
  };
}
