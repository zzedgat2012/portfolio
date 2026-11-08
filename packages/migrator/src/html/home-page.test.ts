import { readFile } from 'node:fs/promises';
import { describe, expect, test } from 'vitest';
import { listFeaturedProjectSlugs, mapHomePageToProfile } from './home-page';

const html = await readFile(new URL('../../fixtures/html/home.html', import.meta.url), 'utf8');
const home = mapHomePageToProfile(html);

describe('[story 1.2] mapHomePageToProfile (recorded home page)', () => {
  test('reads identity and hero', () => {
    expect(home).toMatchObject({
      name: 'Edgar Ferreira',
      role: 'Product Engineer',
      location: 'Aracaju, Sergipe, Brazil',
      heroTitle: 'Product Engineer',
      portraitUrl: 'https://edgar-ferreira.com/app/uploads/2026/08/profile.jpg',
    });
    expect(home.heroTagline).toMatch(/^I design digital products end-to-end — translating/);
    expect(home.heroTagline).toMatch(/measurable and impactful\.$/);
  });

  test('turns the About paragraphs into a Markdown bio with the highlights in bold', () => {
    const paragraphs = home.bio.split('\n\n');
    expect(paragraphs).toHaveLength(3);
    expect(paragraphs[0]).toBe(
      "Hello! I'm **Edgar Ferreira**, a product engineer from Aracaju, Brazil, dedicated to crafting experiences that connect strategy, design, and technology.",
    );
    expect(paragraphs[1]).toMatch(/^With over \*\*5\+ years of experience\*\*, /);
  });

  test('reads technologies, what I do, education and certifications', () => {
    expect(home.technologies).toHaveLength(15);
    expect(home.technologies[0]).toBe('Oracle APEX (Apps, Reports, Forms)');
    expect(home.technologies).toContain('Security & Access (Roles/Grants)');
    expect(home.whatIDo).toHaveLength(4);
    expect(home.whatIDo[0]).toBe(
      'Lead discovery and UX research to align problem statements with measurable outcomes',
    );
    expect(home.education).toEqual([
      'Systems Analysis and Development',
      'Product Design (Design Circuit)',
    ]);
    expect(home.certifications).toEqual([
      { year: 2021, title: 'Oracle Cloud Foundations (Oracle)' },
      { year: 2021, title: 'Oracle APEX Developer (Oracle)' },
    ]);
  });

  test('reads every experience row with YYYY-MM ranges and the role without its description', () => {
    expect(home.experience).toHaveLength(8);
    expect(home.experience[0]).toEqual({
      company: 'Memora Processos Inovadores',
      role: 'Oracle APEX Developer',
      startOn: '2025-03',
    });
    expect(home.experience[1]).toEqual({
      company: 'Serigy',
      role: 'Head of Technology',
      startOn: '2023-11',
    });
    expect(home.experience[7]).toEqual({
      company: 'EightSystems',
      role: 'Oracle APEX Developer',
      startOn: '2017-08',
      endOn: '2017-10',
    });
    expect(home.experienceSummary).toBe(
      '5+ years across product engineering, UX, and Oracle APEX development',
    );
  });

  test('reads the contact block, decoding Cloudflare-protected emails', () => {
    expect(home.contact).toEqual({
      phone: '(79) 98835-9686',
      email: 'efsn88@gmail.com',
      website: 'https://edgar-ferreira.com',
      languages: 'Portuguese (Native), English (Professional)',
    });
  });

  test('merges hero and contact links, keeping the order of both lists', () => {
    expect(home.links).toEqual([
      {
        label: 'Email (Personal)',
        url: 'mailto:efsn88@gmail.com',
        icon: 'email',
        showInHero: false,
        showInContact: true,
      },
      {
        label: 'Portfolio',
        url: 'https://github.com/zzedgat2012',
        icon: 'portfolio',
        showInHero: true,
        showInContact: false,
      },
      {
        label: 'LinkedIn',
        url: 'https://www.linkedin.com/in/efsn88',
        icon: 'linkedin',
        showInHero: true,
        showInContact: true,
      },
      {
        label: 'GitHub',
        url: 'https://github.com/efsn',
        icon: 'github',
        showInHero: false,
        showInContact: true,
      },
      {
        label: 'Portfolio',
        url: 'https://edgar-ferreira.com',
        icon: 'portfolio',
        showInHero: false,
        showInContact: true,
      },
      {
        label: 'WhatsApp',
        url: 'https://wa.me/5579988359686',
        icon: 'whatsapp',
        showInHero: false,
        showInContact: true,
      },
      {
        label: 'Email (Business)',
        url: 'mailto:contato@edgar-ferreira.com',
        icon: 'email',
        showInHero: false,
        showInContact: true,
      },
      {
        label: 'Email',
        url: 'mailto:edgar@serigy.net',
        icon: 'email',
        showInHero: true,
        showInContact: false,
      },
      {
        label: 'Facebook',
        url: 'https://www.facebook.com/efsn88',
        icon: 'facebook',
        showInHero: true,
        showInContact: false,
      },
      {
        label: 'Instagram',
        url: 'https://www.instagram.com/edgar.ferreira95/',
        icon: 'instagram',
        showInHero: true,
        showInContact: false,
      },
    ]);
  });
});

describe('[story 1.2] listFeaturedProjectSlugs (recorded home page)', () => {
  test('lists the projects of the hero carousel in carousel order', () => {
    expect(listFeaturedProjectSlugs(html)).toEqual([
      'kafka-golang-microservices',
      'ecommerce-platform',
      'task-management',
    ]);
  });

  test('returns [] when the page has no carousel', () => {
    expect(listFeaturedProjectSlugs('<main></main>')).toEqual([]);
  });
});
