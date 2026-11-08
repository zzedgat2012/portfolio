/**
 * Union of all page-section types (Decap list widget with `types`, discriminated by `type`).
 *
 * Each section story adds a member here, a variant in the contracts `sectionSchema`, a type in
 * config.yml and a case in blocks/registry.tsx. Until then, `Section` is `never`.
 */
export type Section = never;
