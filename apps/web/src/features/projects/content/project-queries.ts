import { contentModel, NotFoundError } from '@portfolio/contracts';
import { buildTagIndex, listTags } from '@/features/tags';
import { contentSource } from '@/shared/content';
import type { Project } from '../model';
import { toProject } from './project-mapper';

const COLLECTION = 'projects';
const { schema } = contentModel.folders.projects;

/** Every project, by `sortOrder` ascending (then slug). */
export async function listProjects(): Promise<Project[]> {
  const [entries, tags] = await Promise.all([
    contentSource.listEntries(COLLECTION, schema),
    listTags(),
  ]);
  const tagIndex = buildTagIndex(tags);
  return entries
    .map((entry) => toProject(entry, tagIndex))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug));
}

/** Projects flagged `isFeatured` (home carousel), in `sortOrder`. */
export async function listFeaturedProjects(): Promise<Project[]> {
  return (await listProjects()).filter((project) => project.isFeatured);
}

/** The project with that slug; throws `NotFoundError` if there is none. */
export async function getProjectBySlug(slug: string): Promise<Project> {
  const [entry, tags] = await Promise.all([
    contentSource.findEntry(COLLECTION, slug, schema),
    listTags(),
  ]);
  if (!entry) {
    throw new NotFoundError(`project ${slug}`);
  }
  return toProject(entry, buildTagIndex(tags));
}
