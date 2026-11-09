import type { Metadata } from 'next';
import { buildAbsoluteUrl } from './build-absolute-url';
import type { ContentImage } from './content-image';

/** Inputs shared by every page's `generateMetadata`. */
export type PageMetadataInput = {
  /** The page's own title (project or article title, "CV", …); `null` for the home page. */
  title: string | null;
  /** Meta description, usually the entry summary; omitted when null. */
  description: string | null;
  /** Site or owner name appended to the title (`settings/site` › `siteName`). */
  siteName: string;
  /** Canonical origin (`settings/site` › `siteUrl`). */
  siteUrl: string;
  /** The page's route from a `build…Path` function, with its trailing slash. */
  path: string;
  /** Image shared by Open Graph and Twitter (cover or portrait). */
  image: ContentImage | null;
  /** `YYYY-MM-DD`; when set the page is an Open Graph `article`. */
  publishedOn?: string;
};

/** `"<page> | <site>"`, the `<title>` format of every content page. */
export function buildPageTitle(pageTitle: string, siteName: string): string {
  return `${pageTitle} | ${siteName}`;
}

/**
 * Title, description, canonical URL, Open Graph and Twitter card of a page (story 3.1). The title
 * is `absolute`, so it never depends on the root layout's template.
 */
export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const { title, description, siteName, siteUrl, path, image, publishedOn } = input;
  const fullTitle = title === null ? siteName : buildPageTitle(title, siteName);
  const url = buildAbsoluteUrl(siteUrl, path);
  const images = image ? [{ url: buildAbsoluteUrl(siteUrl, image.src), alt: image.alt }] : null;
  const withDescription = description === null ? {} : { description };
  const withImages = images === null ? {} : { images };

  return {
    title: { absolute: fullTitle },
    ...withDescription,
    alternates: { canonical: url },
    openGraph: {
      ...(publishedOn === undefined
        ? { type: 'website' as const }
        : { type: 'article' as const, publishedTime: publishedOn }),
      locale: 'en_US',
      siteName,
      url,
      title: fullTitle,
      ...withDescription,
      ...withImages,
    },
    twitter: {
      card: images === null ? 'summary' : 'summary_large_image',
      title: fullTitle,
      ...withDescription,
      ...withImages,
    },
  };
}
