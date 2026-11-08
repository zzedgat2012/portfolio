import { describe, expect, test } from 'vitest';
import { getProfile } from './profile-queries';

describe('[story 1.1] getProfile', () => {
  test('reads the profile file', async () => {
    const profile = await getProfile();

    expect(profile).toMatchObject({ name: 'Edgar Ferreira', role: 'Product Engineer' });
    expect(profile.experience[0]).toMatchObject({
      company: 'Seed Current Company',
      isCurrent: true,
    });
    expect(profile.links.filter((link) => link.showInHero).map((link) => link.label)).toEqual([
      'Portfolio',
      'LinkedIn',
      'Email (Personal)',
    ]);
  });
});
