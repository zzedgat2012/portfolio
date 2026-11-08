/**
 * Branded type for an entry slug: the file name of a content entry
 * (`content/projects/<slug>.md`) and its public identifier in URLs.
 */
export type Slug = string & { readonly __brand: 'Slug' };

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** True for kebab-case slugs; anything else (paths, `..`, uppercase) is rejected. */
export function isSlug(value: string): value is Slug {
  return SLUG_PATTERN.test(value);
}
