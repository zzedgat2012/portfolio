import type { SiteSettingsFile } from '@portfolio/contracts';
import type { SiteSettings } from '../model';

export function toSiteSettings(file: SiteSettingsFile): SiteSettings {
  return { siteName: file.siteName, description: file.description ?? null };
}
