import type { Metadata } from 'next';

/** Inputs shared by every content page's `generateMetadata`. */
export type PageMetadataInput = {
  /** The page's own title (project or article title, "CV", …). */
  title: string;
  /** Meta description, usually the entry summary; omitted when null. */
  description: string | null;
  /** Site or owner name appended to the title (`settings/site` › `siteName`). */
  siteName: string;
};

/** `"<page> | <site>"`, the `<title>` format of every content page. */
export function buildPageTitle(pageTitle: string, siteName: string): string {
  return `${pageTitle} | ${siteName}`;
}

/**
 * Title and description of a content page. The title is `absolute`, so it never depends on the
 * root layout's template. Story 3.1 extends this with canonical URL and Open Graph.
 */
export function buildPageMetadata({ title, description, siteName }: PageMetadataInput): Metadata {
  const metadata: Metadata = { title: { absolute: buildPageTitle(title, siteName) } };
  if (description !== null) {
    metadata.description = description;
  }
  return metadata;
}
