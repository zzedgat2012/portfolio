import type { ArticleFile } from '@portfolio/contracts';
import { type TagIndex, toTags } from '@/features/tags';
import type { Entry } from '@/shared/content';
import type { Article } from '../model';

const WORDS_PER_MINUTE = 200;

/** Reading time of a Markdown body: ceil(words / 200), never less than one minute. */
export function toReadingTimeMinutes(body: string): number {
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

/** Maps a validated article entry to the domain model; `legacyWpId` is dropped. */
export function toArticle({ slug, data, body }: Entry<ArticleFile>, tagIndex: TagIndex): Article {
  return {
    slug,
    title: data.title,
    summary: data.summary,
    publishedOn: data.publishedOn,
    tags: toTags(data.tags, tagIndex),
    coverImage:
      data.coverImage === undefined
        ? null
        : { src: data.coverImage, alt: data.coverImageAlt ?? data.title },
    readingTimeMinutes: toReadingTimeMinutes(body),
    body,
  };
}
