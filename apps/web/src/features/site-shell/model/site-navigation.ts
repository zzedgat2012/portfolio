/** Header navigation: anchors to the home sections (architecture D1). */
export const SITE_NAV_ITEMS = [
  { id: 'about', label: 'About', href: '/#about' },
  { id: 'projects', label: 'Projects', href: '/#projects' },
  { id: 'articles', label: 'Articles', href: '/#articles' },
  { id: 'contact', label: 'Contact', href: '/#contact' },
] as const;

export type SiteNavItem = (typeof SITE_NAV_ITEMS)[number];
export type SiteNavItemId = SiteNavItem['id'];

/** `page` for a route that belongs to an item, `location` for a home section in the URL hash. */
export type CurrentNavItem = { id: SiteNavItemId; ariaCurrent: 'page' | 'location' };

/** Route prefixes owned by a nav item (D1: `/project/<slug>/`, `/article/<slug>/`). */
const ROUTE_PREFIXES: ReadonlyArray<readonly [prefix: string, id: SiteNavItemId]> = [
  ['/project/', 'projects'],
  ['/article/', 'articles'],
];

function isSiteNavItemId(value: string): value is SiteNavItemId {
  return SITE_NAV_ITEMS.some((item) => item.id === value);
}

/** Which nav item the visitor is on, from the URL path and hash (`#about`). */
export function findCurrentNavItem(pathname: string, hash: string): CurrentNavItem | null {
  for (const [prefix, id] of ROUTE_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return { id, ariaCurrent: 'page' };
    }
  }
  if (pathname !== '/') {
    return null;
  }

  const section = hash.replace(/^#/, '');
  return isSiteNavItemId(section) ? { id: section, ariaCurrent: 'location' } : null;
}
