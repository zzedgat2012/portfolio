import type { Tag } from '@/features/tags';
import type { ContentImage } from '@/shared/lib';

/** A portfolio project (`content/projects/<slug>.md`). */
export type Project = {
  slug: string;
  title: string;
  summary: string;
  coverImage: ContentImage;
  tags: Tag[];
  technologies: string[];
  features: string[];
  demoUrl: string | null;
  codeUrl: string | null;
  sortOrder: number;
  isFeatured: boolean;
  /** Markdown body. */
  overview: string;
};
