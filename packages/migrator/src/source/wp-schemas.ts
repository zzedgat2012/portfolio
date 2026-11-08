import { z } from 'zod';

/**
 * The parts of the WordPress REST payloads (`/wp-json/wp/v2/…`) the migrator reads. Loose
 * objects: WordPress sends many more fields, which are ignored.
 */
const renderedSchema = z.looseObject({ rendered: z.string() });
const wpIdSchema = z.number().int().positive();

export const wpSiteSchema = z.looseObject({
  name: z.string(),
  description: z.string(),
  /** Public site address (`url` is the WordPress core address, `/wp` on Bedrock). */
  home: z.string(),
});

export const wpTermSchema = z.looseObject({ id: wpIdSchema, slug: z.string(), name: z.string() });

export const wpMediaSchema = z.looseObject({
  id: wpIdSchema,
  source_url: z.url(),
  alt_text: z.string(),
  title: renderedSchema,
});

export const wpProjectSchema = z.looseObject({
  id: wpIdSchema,
  slug: z.string(),
  link: z.url(),
  title: renderedSchema,
  excerpt: renderedSchema,
  content: renderedSchema,
  featured_media: z.number().int().nonnegative(),
  menu_order: z.number().int(),
  project_tag: z.array(wpIdSchema),
});

export const wpPostSchema = z.looseObject({
  id: wpIdSchema,
  slug: z.string(),
  link: z.url(),
  date: z.string(),
  title: renderedSchema,
  excerpt: renderedSchema,
  content: renderedSchema,
  featured_media: z.number().int().nonnegative(),
  tags: z.array(wpIdSchema),
});

export type WpSite = z.infer<typeof wpSiteSchema>;
export type WpTerm = z.infer<typeof wpTermSchema>;
export type WpMedia = z.infer<typeof wpMediaSchema>;
export type WpProject = z.infer<typeof wpProjectSchema>;
export type WpPost = z.infer<typeof wpPostSchema>;

/** Everything the migrator reads from WordPress, validated: REST payloads and rendered pages. */
export type WpSnapshot = {
  site: WpSite;
  projects: WpProject[];
  posts: WpPost[];
  tags: WpTerm[];
  projectTags: WpTerm[];
  media: WpMedia[];
  homeHtml: string;
  /** Rendered `/project/<slug>/` pages by slug. */
  projectHtml: Record<string, string>;
  /** Rendered `/article/<slug>/` pages by slug. */
  articleHtml: Record<string, string>;
};

/** The REST endpoints of a snapshot, by the file name they are recorded under (`rest/<name>.json`). */
export const WP_REST_ENDPOINTS = {
  root: '/wp-json',
  project: '/wp-json/wp/v2/project',
  project_tag: '/wp-json/wp/v2/project_tag',
  posts: '/wp-json/wp/v2/posts',
  tags: '/wp-json/wp/v2/tags',
  media: '/wp-json/wp/v2/media',
} as const;

export type WpRestName = keyof typeof WP_REST_ENDPOINTS;

/** Raw payloads, as fetched or recorded, before validation. */
export type RawSnapshot = {
  rest: Record<WpRestName, unknown>;
  homeHtml: string;
  projectHtml: Record<string, string>;
  articleHtml: Record<string, string>;
};

/** Validates the REST payloads of a raw snapshot. */
export function toWpSnapshot(raw: RawSnapshot): WpSnapshot {
  return {
    site: wpSiteSchema.parse(raw.rest.root),
    projects: z.array(wpProjectSchema).parse(raw.rest.project),
    posts: z.array(wpPostSchema).parse(raw.rest.posts),
    tags: z.array(wpTermSchema).parse(raw.rest.tags),
    projectTags: z.array(wpTermSchema).parse(raw.rest.project_tag),
    media: z.array(wpMediaSchema).parse(raw.rest.media),
    homeHtml: raw.homeHtml,
    projectHtml: raw.projectHtml,
    articleHtml: raw.articleHtml,
  };
}

/** File name a rendered page is recorded under (`html/<name>.html`). */
export function buildPageFileName(kind: 'project' | 'article', slug: string): string {
  return `${kind}-${slug}`;
}
