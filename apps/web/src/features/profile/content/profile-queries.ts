import { contentModel } from '@portfolio/contracts';
import { contentSource } from '@/shared/content';
import type { Profile } from '../model';
import { toProfile } from './profile-mapper';

const { path, schema } = contentModel.files['settings/profile'];

export async function getProfile(): Promise<Profile> {
  return toProfile(await contentSource.getFile(path, schema));
}
