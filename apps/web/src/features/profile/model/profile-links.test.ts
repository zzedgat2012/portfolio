import { describe, expect, test } from 'vitest';
import type { ProfileLink } from './profile';
import { findProfileLinkByIcon } from './profile-links';

const LINKS: ProfileLink[] = [
  {
    label: 'LinkedIn',
    url: 'https://linkedin.com/in/x',
    icon: 'linkedin',
    showInHero: true,
    showInContact: true,
  },
  {
    label: 'GitHub',
    url: 'https://github.com/x',
    icon: 'github',
    showInHero: false,
    showInContact: true,
  },
  {
    label: 'GitHub (work)',
    url: 'https://github.com/y',
    icon: 'github',
    showInHero: false,
    showInContact: false,
  },
];

describe('[story 2.2] profile links', () => {
  test('findProfileLinkByIcon returns the first link with that icon', () => {
    expect(findProfileLinkByIcon(LINKS, 'github')?.url).toBe('https://github.com/x');
  });

  test('findProfileLinkByIcon returns null when no link has that icon', () => {
    expect(findProfileLinkByIcon(LINKS, 'instagram')).toBeNull();
  });
});
