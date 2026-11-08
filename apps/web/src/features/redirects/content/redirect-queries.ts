import { contentModel } from '@portfolio/contracts';
import { contentSource } from '@/shared/content';
import type { Redirect } from '../model';
import { toRedirects } from './redirect-mapper';

const { path, schema } = contentModel.files['settings/redirects'];

/** Every redirect, in file order. */
export async function listRedirects(): Promise<Redirect[]> {
  return toRedirects(await contentSource.getFile(path, schema));
}
