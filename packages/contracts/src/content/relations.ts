import type { ContentModel } from './content-model';

/** A validated entry as far as relation checks care: its slug and its data. */
export type RelationEntry = { readonly slug: string; readonly data: unknown };

function readSlugs(data: unknown, field: string): string[] {
  if (typeof data !== 'object' || data === null) {
    return [];
  }
  const value: unknown = (data as Record<string, unknown>)[field];
  if (typeof value === 'string') {
    return [value];
  }
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

/**
 * Every relation slug that does not match an entry of its target collection, as messages naming
 * the file, the field and the slug. `entries` maps folder collection names to their entries; a
 * missing collection counts as empty.
 */
export function listBrokenRelations(
  model: ContentModel,
  entries: Readonly<Record<string, readonly RelationEntry[]>>,
): string[] {
  const problems: string[] = [];
  for (const [collection, folder] of Object.entries(model.folders)) {
    for (const relation of folder.relations ?? []) {
      const targets = new Set((entries[relation.collection] ?? []).map((entry) => entry.slug));
      for (const entry of entries[collection] ?? []) {
        for (const slug of readSlugs(entry.data, relation.field)) {
          if (!targets.has(slug)) {
            problems.push(
              `${collection}/${entry.slug}.${folder.extension}: ${relation.field} references "${slug}", which is not in ${relation.collection}`,
            );
          }
        }
      }
    }
  }
  return problems;
}
