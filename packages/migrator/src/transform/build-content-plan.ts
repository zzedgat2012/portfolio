import path from 'node:path';
import {
  articleFileSchema,
  type ProfileFile,
  profileFileSchema,
  projectFileSchema,
  type RedirectsFile,
  siteSettingsFileSchema,
  tagFileSchema,
  ValidationError,
} from '@portfolio/contracts';
import { load } from 'cheerio';
import { z } from 'zod';
import {
  listFeaturedProjectSlugs,
  mapArticlePageToExtras,
  mapHomePageToProfile,
  mapProjectPageToExtras,
} from '../html';
import { toMarkdown } from '../markdown';
import { toMarkdownDocument, toYamlDocument } from '../serialize';
import type { WpMedia, WpPost, WpProject, WpSnapshot, WpTerm } from '../source';

export type EntryCollection = 'projects' | 'articles' | 'tags';

/** One file of a folder collection: `content/<collection>/<slug>.<md|yml>`. */
export type PlannedEntry = {
  collection: EntryCollection;
  slug: string;
  extension: 'md' | 'yml';
  legacyWpId?: number;
  contents: string;
};

/** A file collection file, path relative to `content/`. */
export type PlannedFile = { path: string; contents: string };

/** A WordPress upload to store as `uploads/<fileName>`. */
export type PlannedMedia = { url: string; fileName: string; legacyWpId: number };

export type ContentPlan = {
  /** Load order: tags, then projects, then articles. */
  entries: PlannedEntry[];
  /** `settings/site.yml` and `settings/profile.yml` (overwritten). */
  files: PlannedFile[];
  media: PlannedMedia[];
  /** Redirects that must exist in `settings/redirects.yml` (merged with the ones already there). */
  redirects: RedirectsFile['redirects'];
  /** Things a human should look at; the import still succeeds. */
  warnings: string[];
};

export const REQUIRED_REDIRECTS: RedirectsFile['redirects'] = [
  { from: '/wp-sitemap.xml', to: '/sitemap.xml', status: 301 },
  { from: '/feed/', to: '/feed.xml', status: 301 },
];

const SITE_DESCRIPTION_MAX = 160;

function validate<S extends z.ZodType>(label: string, schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(`${label}: ${z.prettifyError(result.error)}`);
  }
  return result.data;
}

/** Rendered WordPress HTML (titles, excerpts) to plain text with entities decoded. */
function toText(html: string): string {
  return load(`<div>${html}</div>`)('div').first().text().replace(/\s+/g, ' ').trim();
}

function toUploadFileName(url: string): string {
  return path.posix.basename(new URL(url).pathname);
}

function toUploadPath(url: string): string {
  return `/uploads/${toUploadFileName(url)}`;
}

/** The site description: WordPress' tagline, else the first bio sentence of the profile. */
function toSiteDescription(tagline: string, bio: string): string {
  if (tagline.trim() !== '') {
    return tagline.trim();
  }
  const firstParagraph = (bio.split('\n\n')[0] ?? '')
    .replaceAll('**', '')
    .replace(/^Hello!\s+I'm\s+/i, '');
  return firstParagraph.length <= SITE_DESCRIPTION_MAX
    ? firstParagraph
    : `${firstParagraph.slice(0, SITE_DESCRIPTION_MAX - 1).trimEnd()}…`;
}

type TagIndex = {
  /** Slug of a `tags` term id. */
  postTagSlugs: Map<number, string>;
  /** Slug of a `project_tag` term id. */
  projectTagSlugs: Map<number, string>;
  /** Display name by slug (both taxonomies merged). */
  names: Map<string, string>;
};

function indexTags(tags: WpTerm[], projectTags: WpTerm[], warnings: string[]): TagIndex {
  const names = new Map<string, string>();
  for (const term of [...tags, ...projectTags]) {
    const name = toText(term.name);
    const known = names.get(term.slug);
    if (known !== undefined && known !== name) {
      warnings.push(`tag "${term.slug}" is named "${known}" and "${name}"; kept "${known}"`);
    }
    if (known === undefined) {
      names.set(term.slug, name);
    }
  }
  return {
    postTagSlugs: new Map(tags.map((term) => [term.id, term.slug])),
    projectTagSlugs: new Map(projectTags.map((term) => [term.id, term.slug])),
    names,
  };
}

function toTagSlugs(label: string, ids: number[], slugsById: Map<number, string>): string[] {
  return ids.map((id) => {
    const slug = slugsById.get(id);
    if (slug === undefined) {
      throw new ValidationError(`${label}: unknown term id ${id}`);
    }
    return slug;
  });
}

function planProject(
  project: WpProject,
  context: { media: Map<number, WpMedia>; tags: TagIndex; featured: Set<string>; html: string },
): PlannedEntry {
  const label = `projects/${project.slug}`;
  const title = toText(project.title.rendered);
  const cover = context.media.get(project.featured_media);
  const extras = mapProjectPageToExtras(context.html);
  // WordPress lists project terms by term id (the live pages show "Golang • Kafka • Docker").
  const tagIds = [...project.project_tag].sort((a, b) => a - b);
  const data = validate(label, projectFileSchema, {
    title,
    summary: toText(project.excerpt.rendered),
    coverImage: cover ? toUploadPath(cover.source_url) : undefined,
    coverImageAlt: cover ? toText(cover.alt_text) || title : undefined,
    tags: toTagSlugs(label, tagIds, context.tags.projectTagSlugs),
    technologies: extras.technologies,
    features: extras.features,
    ...(extras.demoUrl ? { demoUrl: extras.demoUrl } : {}),
    ...(extras.codeUrl ? { codeUrl: extras.codeUrl } : {}),
    sortOrder: project.menu_order,
    isFeatured: context.featured.has(project.slug),
    legacyWpId: project.id,
  });
  return {
    collection: 'projects',
    slug: project.slug,
    extension: 'md',
    legacyWpId: project.id,
    contents: toMarkdownDocument(data, toMarkdown(project.content.rendered)),
  };
}

function planArticle(
  post: WpPost,
  context: { media: Map<number, WpMedia>; tags: TagIndex; html: string; warnings: string[] },
): PlannedEntry {
  const label = `articles/${post.slug}`;
  const title = toText(post.title.rendered);
  const publishedOn = post.date.slice(0, 10);
  const shownOn = mapArticlePageToExtras(context.html).publishedOn;
  if (shownOn !== null && shownOn !== publishedOn) {
    context.warnings.push(`${label}: REST date ${publishedOn} but the page shows ${shownOn}`);
  }
  const cover = post.featured_media === 0 ? undefined : context.media.get(post.featured_media);
  // WordPress lists post tags by name (the live pages show "Docker, Golang, Kafka, …").
  const tags = toTagSlugs(label, post.tags, context.tags.postTagSlugs).sort((a, b) =>
    (context.tags.names.get(a) ?? a).localeCompare(context.tags.names.get(b) ?? b, 'en'),
  );
  const data = validate(label, articleFileSchema, {
    title,
    summary: toText(post.excerpt.rendered),
    publishedOn,
    tags,
    ...(cover
      ? {
          coverImage: toUploadPath(cover.source_url),
          coverImageAlt: toText(cover.alt_text) || title,
        }
      : {}),
    legacyWpId: post.id,
  });
  return {
    collection: 'articles',
    slug: post.slug,
    extension: 'md',
    legacyWpId: post.id,
    contents: toMarkdownDocument(data, toMarkdown(post.content.rendered)),
  };
}

function findPage(pages: Record<string, string>, label: string, slug: string): string {
  const html = pages[slug];
  if (html === undefined) {
    throw new ValidationError(`${label}/${slug}: the rendered page was not read`);
  }
  return html;
}

/**
 * Transforms a WordPress snapshot into the content files of architecture D2. Pure: nothing is
 * written. Every record is validated with the `@portfolio/contracts` schemas; the first invalid
 * one throws a `ValidationError` naming it.
 */
export function buildContentPlan(snapshot: WpSnapshot): ContentPlan {
  const warnings: string[] = [];
  const media = new Map(snapshot.media.map((item) => [item.id, item]));
  const tags = indexTags(snapshot.tags, snapshot.projectTags, warnings);
  const featured = new Set(listFeaturedProjectSlugs(snapshot.homeHtml));

  const tagEntries: PlannedEntry[] = [...tags.names.entries()]
    .sort(([a], [b]) => a.localeCompare(b, 'en'))
    .map(([slug, name]) => ({
      collection: 'tags',
      slug,
      extension: 'yml',
      contents: toYamlDocument(validate(`tags/${slug}`, tagFileSchema, { name })),
    }));

  const projectEntries = [...snapshot.projects]
    .sort((a, b) => a.menu_order - b.menu_order)
    .map((project) =>
      planProject(project, {
        media,
        tags,
        featured,
        html: findPage(snapshot.projectHtml, 'projects', project.slug),
      }),
    );

  const articleEntries = snapshot.posts.map((post) =>
    planArticle(post, {
      media,
      tags,
      warnings,
      html: findPage(snapshot.articleHtml, 'articles', post.slug),
    }),
  );

  const { portraitUrl, ...home } = mapHomePageToProfile(snapshot.homeHtml);
  const profile: ProfileFile = validate('settings/profile', profileFileSchema, {
    ...home,
    portrait: portraitUrl ? toUploadPath(portraitUrl) : undefined,
    portraitAlt: `Portrait of ${home.name}`,
  });
  const site = validate('settings/site', siteSettingsFileSchema, {
    siteName: toText(snapshot.site.name),
    description: toSiteDescription(toText(snapshot.site.description), profile.bio),
    siteUrl: snapshot.site.home.replace(/\/+$/, ''),
  });

  const plannedMedia: PlannedMedia[] = snapshot.media.map((item) => ({
    url: item.source_url,
    fileName: toUploadFileName(item.source_url),
    legacyWpId: item.id,
  }));
  const fileNames = plannedMedia.map((item) => item.fileName);
  const duplicate = fileNames.find((name, index) => fileNames.indexOf(name) !== index);
  if (duplicate !== undefined) {
    throw new ValidationError(`media: two uploads are named "${duplicate}"`);
  }
  if (portraitUrl && !fileNames.includes(toUploadFileName(portraitUrl))) {
    throw new ValidationError(
      `settings/profile: portrait ${portraitUrl} is not in the media library`,
    );
  }

  return {
    entries: [...tagEntries, ...projectEntries, ...articleEntries],
    files: [
      { path: 'settings/site.yml', contents: toYamlDocument(site) },
      { path: 'settings/profile.yml', contents: toYamlDocument(profile) },
    ],
    media: plannedMedia,
    redirects: REQUIRED_REDIRECTS,
    warnings,
  };
}
