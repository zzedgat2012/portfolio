import type { ProfileFile } from '@portfolio/contracts';
import { describe, expect, test } from 'vitest';
import { toProfile } from './profile-mapper';

const file: ProfileFile = {
  name: 'Edgar Ferreira',
  role: 'Product Engineer',
  location: 'Aracaju',
  heroTitle: 'Product Engineer',
  heroTagline: 'Tagline',
  portrait: '/uploads/me.jpg',
  portraitAlt: 'Edgar',
  bio: 'Bio',
  technologies: ['APEX'],
  whatIDo: ['Discovery'],
  education: [],
  certifications: [{ year: 2021, title: 'OCI' }],
  experience: [
    { company: 'Memora', role: 'Dev', startOn: '2025-03' },
    { company: 'Serigy', role: 'Head', startOn: '2023-11', endOn: '2024-02' },
  ],
  experienceSummary: '5+ years',
  contact: { phone: '1', email: 'e@x.com', website: 'https://x.com', languages: 'PT' },
  links: [
    {
      label: 'GitHub',
      url: 'https://github.com/x',
      icon: 'github',
      showInHero: false,
      showInContact: true,
    },
  ],
};

describe('[story 1.1] toProfile', () => {
  test('maps the portrait to an image and keeps the profile groups', () => {
    const profile = toProfile(file);

    expect(profile.portrait).toEqual({ src: '/uploads/me.jpg', alt: 'Edgar' });
    expect(profile).not.toHaveProperty('portraitAlt');
    expect(profile.certifications).toEqual([{ year: 2021, title: 'OCI' }]);
    expect(profile.links).toEqual(file.links);
    expect(profile.contact).toEqual(file.contact);
  });

  test('marks open experience ranges as current with a null end', () => {
    expect(toProfile(file).experience).toEqual([
      { company: 'Memora', role: 'Dev', startOn: '2025-03', endOn: null, isCurrent: true },
      { company: 'Serigy', role: 'Head', startOn: '2023-11', endOn: '2024-02', isCurrent: false },
    ]);
  });
});
