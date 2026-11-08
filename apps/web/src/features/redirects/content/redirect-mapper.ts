import type { RedirectsFile } from '@portfolio/contracts';
import type { Redirect } from '../model';

export function toRedirects(file: RedirectsFile): Redirect[] {
  return file.redirects.map(({ from, to, status }) => ({ from, to, status }));
}
