import { contentModel } from '@portfolio/contracts';
import { contentSource } from '@/shared/content';
import type { SiteSettings } from '../model';
import { toSiteSettings } from './site-settings-mapper';

const { path, schema } = contentModel.files['settings/site'];

export async function getSiteSettings(): Promise<SiteSettings> {
  return toSiteSettings(await contentSource.getFile(path, schema));
}
