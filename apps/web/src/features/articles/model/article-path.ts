/** Route of an article page (architecture D1): `/article/<slug>/`. */
export function buildArticlePath(slug: string): string {
  return `/article/${slug}/`;
}
