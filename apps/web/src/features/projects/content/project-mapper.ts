import type { ProjectFile } from '@portfolio/contracts';
import { type TagIndex, toTags } from '@/features/tags';
import type { Entry } from '@/shared/content';
import type { Project } from '../model';

/** Maps a validated project entry to the domain model; `legacyWpId` is dropped. */
export function toProject({ slug, data, body }: Entry<ProjectFile>, tagIndex: TagIndex): Project {
  return {
    slug,
    title: data.title,
    summary: data.summary,
    coverImage: { src: data.coverImage, alt: data.coverImageAlt },
    tags: toTags(data.tags, tagIndex),
    technologies: data.technologies,
    features: data.features,
    demoUrl: data.demoUrl ?? null,
    codeUrl: data.codeUrl ?? null,
    sortOrder: data.sortOrder,
    isFeatured: data.isFeatured,
    overview: body,
  };
}
