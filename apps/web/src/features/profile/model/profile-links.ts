import type { LinkIcon } from '@portfolio/contracts';
import type { ProfileLink } from './profile';

/** The first profile link with that icon (e.g. the GitHub profile), or `null`. */
export function findProfileLinkByIcon(
  links: readonly ProfileLink[],
  icon: LinkIcon,
): ProfileLink | null {
  return links.find((link) => link.icon === icon) ?? null;
}
