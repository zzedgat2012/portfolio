/** `https://edgar-ferreira.com/` → `edgar-ferreira.com`. */
export function toWebsiteLabel(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}
