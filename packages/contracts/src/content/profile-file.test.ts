import { describe, expect, test } from 'vitest';
import { type ProfileFile, profileFileSchema } from './profile-file';

const profile: ProfileFile = {
  name: 'Edgar Ferreira',
  role: 'Product Engineer',
  location: 'Aracaju, Sergipe, Brazil',
  heroTitle: 'Product Engineer',
  heroTagline: 'Designs digital products end-to-end.',
  portrait: '/uploads/portrait.jpg',
  portraitAlt: 'Edgar Ferreira',
  bio: "Hello! I'm **Edgar**.",
  technologies: ['Oracle APEX'],
  whatIDo: ['Lead discovery'],
  education: ['Systems Analysis'],
  certifications: [{ year: 2021, title: 'Oracle Cloud Foundations' }],
  experience: [
    { company: 'Memora', role: 'Oracle APEX Developer', startOn: '2025-03' },
    { company: 'EightSystems', role: 'Developer', startOn: '2018-07', endOn: '2021-04' },
  ],
  experienceSummary: '5+ years across product engineering',
  contact: {
    phone: '(79) 98835-9686',
    email: 'edgar@example.com',
    website: 'https://edgar-ferreira.com',
    languages: 'Portuguese (Native) · English (Professional)',
  },
  links: [
    {
      label: 'LinkedIn',
      url: 'https://linkedin.com/in/x',
      icon: 'linkedin',
      showInHero: true,
      showInContact: true,
    },
    {
      label: 'Email',
      url: 'mailto:edgar@example.com',
      icon: 'email',
      showInHero: false,
      showInContact: true,
    },
  ],
};

describe('[story 1.1] profileFileSchema', () => {
  test('accepts a complete profile', () => {
    expect(profileFileSchema.parse(profile)).toEqual(profile);
  });

  test('defaults optional lists and link visibility flags', () => {
    const { education: _e, certifications: _c, ...rest } = profile;
    const parsed = profileFileSchema.parse({
      ...rest,
      links: [{ label: 'GitHub', url: 'https://github.com/x', icon: 'github' }],
    });
    expect(parsed.education).toEqual([]);
    expect(parsed.certifications).toEqual([]);
    expect(parsed.links[0]).toMatchObject({ showInHero: false, showInContact: false });
  });

  test('rejects experience months that are not YYYY-MM', () => {
    const bad = { ...profile, experience: [{ company: 'A', role: 'B', startOn: '2025-3' }] };
    expect(profileFileSchema.safeParse(bad).success).toBe(false);
  });

  test('rejects an experience that ends before it starts', () => {
    const bad = {
      ...profile,
      experience: [{ company: 'A', role: 'B', startOn: '2025-03', endOn: '2024-01' }],
    };
    expect(profileFileSchema.safeParse(bad).success).toBe(false);
  });

  test('rejects an unknown link icon and an invalid email', () => {
    const badIcon = { ...profile, links: [{ ...profile.links[0], icon: 'myspace' }] };
    expect(profileFileSchema.safeParse(badIcon).success).toBe(false);
    const badEmail = { ...profile, contact: { ...profile.contact, email: 'nope' } };
    expect(profileFileSchema.safeParse(badEmail).success).toBe(false);
  });

  test('rejects empty required lists', () => {
    expect(profileFileSchema.safeParse({ ...profile, experience: [] }).success).toBe(false);
    expect(profileFileSchema.safeParse({ ...profile, technologies: [] }).success).toBe(false);
  });
});
