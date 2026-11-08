/**
 * Union of all dynamic-zone block types.
 *
 * Each block story adds a new member here and a matching case in
 * blocks/registry.tsx. Until then, `Block` is `never` — the registry's
 * switch is already exhaustive.
 */
export type Block = never;
