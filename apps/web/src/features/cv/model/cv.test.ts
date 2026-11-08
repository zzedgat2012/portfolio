import { describe, expect, test } from 'vitest';
import type { Profile } from '@/features/profile';
import type { SiteSettings } from '@/features/settings';
import { toCv } from './cv';

const PROFILE: Profile = {
  name: 'Edgar Ferreira',
  role: 'Product Engineer',
  location: 'Aracaju, Sergipe, Brazil',
  heroTitle: 'Product Engineer',
  heroTagline: 'Tagline',
  portrait: { src: '/uploads/seed-portrait.png', alt: 'Portrait' },
  bio: "Hello! I'm **Edgar**.",
  technologies: ['Oracle APEX', 'API Design (REST)', 'Design Systems'],
  whatIDo: ['Discovery'],
  education: ['Systems Analysis and Development'],
  certifications: [
    { year: 2021, title: 'Oracle Cloud Foundations (Oracle)' },
    { year: 2019, title: 'Scrum Foundations' },
  ],
  experience: [
    {
      company: 'Current Co',
      role: 'Developer',
      startOn: '2025-03',
      endOn: null,
      isCurrent: true,
    },
    {
      company: 'Past Co',
      role: 'PHP Developer',
      startOn: '2023-09',
      endOn: '2023-11',
      isCurrent: false,
    },
  ],
  experienceSummary: '5+ years',
  contact: {
    phone: '(79) 90000-0000',
    email: 'seed@example.com',
    website: 'https://edgar-ferreira.com/',
    languages: 'Portuguese',
  },
  links: [],
};

const SETTINGS: SiteSettings = {
  siteName: 'Edgar Ferreira',
  description: null,
  siteUrl: 'https://www.edgar-ferreira.com',
};

describe('[story 2.5] toCv', () => {
  test('keeps name and role and joins location, phone and website label with bullets', () => {
    const cv = toCv(PROFILE, SETTINGS);

    expect(cv.name).toBe('Edgar Ferreira');
    expect(cv.role).toBe('Product Engineer');
    expect(cv.contactLine).toBe('Aracaju, Sergipe, Brazil • (79) 90000-0000 • edgar-ferreira.com');
  });

  test('leaves empty contact parts out of the contact line', () => {
    const cv = toCv({ ...PROFILE, contact: { ...PROFILE.contact, phone: '' } }, SETTINGS);

    expect(cv.contactLine).toBe('Aracaju, Sergipe, Brazil • edgar-ferreira.com');
  });

  test('uses the bio Markdown as the summary and joins technologies into one skills line', () => {
    const cv = toCv(PROFILE, SETTINGS);

    expect(cv.summary).toBe("Hello! I'm **Edgar**.");
    expect(cv.skills).toBe('Oracle APEX • API Design (REST) • Design Systems');
  });

  test('maps experience to company, role and date range, in file order', () => {
    expect(toCv(PROFILE, SETTINGS).experience).toEqual([
      { company: 'Current Co', role: 'Developer', dateRange: 'Mar 2025 – Present' },
      { company: 'Past Co', role: 'PHP Developer', dateRange: 'Sep 2023 – Nov 2023' },
    ]);
  });

  test('keeps education and labels certifications "<year> · <title>"', () => {
    const cv = toCv(PROFILE, SETTINGS);

    expect(cv.education).toEqual(['Systems Analysis and Development']);
    expect(cv.certifications).toEqual([
      '2021 · Oracle Cloud Foundations (Oracle)',
      '2019 · Scrum Foundations',
    ]);
  });

  test('builds the footer from the site URL', () => {
    expect(toCv(PROFILE, SETTINGS).footer).toBe('www.edgar-ferreira.com • Generated from the site');
  });
});
