import { contentModel, NotFoundError } from '@portfolio/contracts';
import { buildTagIndex, listTags } from '@/features/tags';
import { contentSource } from '@/shared/content';
import type { Article } from '../model';
import { toArticle } from './article-mapper';

const COLLECTION = 'articles';
const { schema } = contentModel.folders.articles;

/** Every article, newest first (`publishedOn` descending, then slug). */
export async function listArticles(): Promise<Article[]> {
  const [entries, tags] = await Promise.all([
    contentSource.listEntries(COLLECTION, schema),
    listTags(),
  ]);
  const tagIndex = buildTagIndex(tags);
  return entries
    .map((entry) => toArticle(entry, tagIndex))
    .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn) || a.slug.localeCompare(b.slug));
}

/** The article with that slug; throws `NotFoundError` if there is none. */
export async function getArticleBySlug(slug: string): Promise<Article> {
  const [entry, tags] = await Promise.all([
    contentSource.findEntry(COLLECTION, slug, schema),
    listTags(),
  ]);
  if (!entry) {
    throw new NotFoundError(`article ${slug}`);
  }
  return toArticle(entry, buildTagIndex(tags));
}
