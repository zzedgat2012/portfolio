import { buildProjectPath, type Project } from '@/features/projects';
import type { ContentImage } from '@/shared/lib';

/** Plain, serialisable data of one carousel slide (passed to the client component). */
export type FeaturedSlide = {
  slug: string;
  href: string;
  title: string;
  summary: string;
  tags: string[];
  cover: ContentImage;
};

export function toFeaturedSlide(project: Project): FeaturedSlide {
  return {
    slug: project.slug,
    href: buildProjectPath(project.slug),
    title: project.title,
    summary: project.summary,
    tags: project.tags.map((tag) => tag.name),
    cover: { src: project.coverImage.src, alt: project.coverImage.alt },
  };
}
