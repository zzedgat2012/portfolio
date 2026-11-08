/** Site-wide settings, from `content/settings/site.yml`. */
export type SiteSettings = {
  siteName: string;
  description: string | null;
  /** Canonical origin without trailing slash, e.g. `https://edgar-ferreira.com`. */
  siteUrl: string;
};
