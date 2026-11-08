import type { Tag } from '@/features/tags';
import type { ContentImage } from '@/shared/lib';

/** A blog article (`content/articles/<slug>.md`). */
export type Article = {
  slug: string;
  title: string;
  summary: string;
  /** `YYYY-MM-DD`. */
  publishedOn: string;
  tags: Tag[];
  coverImage: ContentImage | null;
  /** ceil(words / 200), at least 1. */
  readingTimeMinutes: number;
  /** Markdown body. */
  body: string;
};
