import { type TagFile, ValidationError } from '@portfolio/contracts';
import type { Entry } from '@/shared/content';
import type { Tag, TagIndex } from '../model';

export function toTag(entry: Entry<TagFile>): Tag {
  return { slug: entry.slug, name: entry.data.name };
}

export function buildTagIndex(tags: readonly Tag[]): TagIndex {
  return new Map(tags.map((tag) => [tag.slug, tag]));
}

/** Resolves relation slugs to tags, in order; throws if a slug has no tag file. */
export function toTags(slugs: readonly string[], index: TagIndex): Tag[] {
  return slugs.map((slug) => {
    const tag = index.get(slug);
    if (!tag) {
      throw new ValidationError(`unknown tag "${slug}"`);
    }
    return tag;
  });
}
