/**
 * Absolute URL of a route on the site: `siteUrl` (`settings/site` › `siteUrl`) + a path from a
 * `build…Path` function. Used for share links today and canonical URLs / feeds in story 3.1.
 */
export function buildAbsoluteUrl(siteUrl: string, path: string): string {
  return `${siteUrl.replace(/\/+$/, '')}${path}`;
}
