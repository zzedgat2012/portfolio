import { describe, expect, it } from 'vitest';
import { findCurrentNavItem, SITE_NAV_ITEMS } from './site-navigation';

describe('SITE_NAV_ITEMS', () => {
  it('links About, Projects, Articles and Contact to the home sections, in that order', () => {
    expect(SITE_NAV_ITEMS.map(({ label, href }) => [label, href])).toEqual([
      ['About', '/#about'],
      ['Projects', '/#projects'],
      ['Articles', '/#articles'],
      ['Contact', '/#contact'],
    ]);
  });
});

describe('findCurrentNavItem', () => {
  it('marks a home section named in the hash as the current location', () => {
    expect(findCurrentNavItem('/', '#contact')).toEqual({ id: 'contact', ariaCurrent: 'location' });
  });

  it('returns null on the home page without a known section hash', () => {
    expect(findCurrentNavItem('/', '')).toBeNull();
    expect(findCurrentNavItem('/', '#main-content')).toBeNull();
  });

  it('marks Projects as the current page on a project route', () => {
    expect(findCurrentNavItem('/project/seed-featured-project/', '')).toEqual({
      id: 'projects',
      ariaCurrent: 'page',
    });
  });

  it('marks Articles as the current page on an article route, whatever the hash', () => {
    expect(findCurrentNavItem('/article/seed-another-article/', '#about')).toEqual({
      id: 'articles',
      ariaCurrent: 'page',
    });
  });

  it('ignores section hashes outside the home page', () => {
    expect(findCurrentNavItem('/cv/', '#about')).toBeNull();
  });
});
