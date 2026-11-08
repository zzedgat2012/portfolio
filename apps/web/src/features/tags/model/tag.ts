/** A tag shared by projects and articles (`content/tags/<slug>.yml`). */
export type Tag = {
  slug: string;
  name: string;
};

/** Tags by slug, used by mappers to resolve relation slugs. */
export type TagIndex = ReadonlyMap<string, Tag>;
