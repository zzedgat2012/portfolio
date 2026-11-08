import { contentModel } from '@portfolio/contracts';
import { contentSource } from '@/shared/content';
import type { Tag } from '../model';
import { toTag } from './tag-mapper';

const { schema } = contentModel.folders.tags;

/** Every tag, sorted by name. */
export async function listTags(): Promise<Tag[]> {
  const entries = await contentSource.listEntries('tags', schema);
  return entries.map(toTag).sort((a, b) => a.name.localeCompare(b.name, 'en'));
}
