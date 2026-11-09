import { describe, expect, test } from 'vitest';
import type { Article } from '@/features/articles';
import type { Profile } from '@/features/profile';
import type { Project } from '@/features/projects';
import { buildArticleJsonLd, buildPersonJsonLd, buildProjectJsonLd } from './structured-data';

const SITE_URL = 'https://edgar-ferreira.com';

const PROFILE = {
  name: 'Edgar Ferreira',
  role: 'Product Engineer',
  heroTagline: 'Designs digital products end-to-end.',
  portrait: { src: '/uploads/profile.jpg', alt: 'Portrait' },
  links: [
    { label: 'Portfolio', url: 'https://edgar-ferreira.com', icon: 'portfolio' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/edgar', icon: 'linkedin' },
    { label: 'GitHub', url: 'https://github.com/edgar', icon: 'github' },
    { label: 'Email', url: 'mailto:edgar@example.com', icon: 'email' },
  ],
} as unknown as Profile;

const AUTHOR = { '@type': 'Person', name: 'Edgar Ferreira', url: 'https://edgar-ferreira.com/' };

const TAGS = [
  { slug: 'kafka', name: 'Kafka' },
  { slug: 'golang', name: 'Go' },
];

describe('[story 3.1] buildPersonJsonLd', () => {
  test('describes the profile with its external links as sameAs', () => {
    expect(buildPersonJsonLd(PROFILE, SITE_URL)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Edgar Ferreira',
      jobTitle: 'Product Engineer',
      description: 'Designs digital products end-to-end.',
      url: 'https://edgar-ferreira.com/',
      image: 'https://edgar-ferreira.com/uploads/profile.jpg',
      sameAs: ['https://www.linkedin.com/in/edgar', 'https://github.com/edgar'],
    });
  });
});

describe('[story 3.1] buildArticleJsonLd', () => {
  const article = {
    slug: 'kafka-golang-setup',
    title: 'Kafka + Go',
    summary: 'The simplest example.',
    publishedOn: '2025-12-19',
    tags: TAGS,
    coverImage: { src: '/uploads/kafka.png', alt: 'Kafka' },
  } as Article;

  test('describes the article, its author and its keywords', () => {
    expect(buildArticleJsonLd(article, PROFILE, SITE_URL)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Kafka + Go',
      description: 'The simplest example.',
      datePublished: '2025-12-19',
      url: 'https://edgar-ferreira.com/article/kafka-golang-setup/',
      mainEntityOfPage: 'https://edgar-ferreira.com/article/kafka-golang-setup/',
      image: 'https://edgar-ferreira.com/uploads/kafka.png',
      keywords: ['Kafka', 'Go'],
      author: AUTHOR,
    });
  });

  test('falls back to the portrait when the article has no cover', () => {
    expect(buildArticleJsonLd({ ...article, coverImage: null }, PROFILE, SITE_URL).image).toBe(
      'https://edgar-ferreira.com/uploads/profile.jpg',
    );
  });
});

describe('[story 3.1] buildProjectJsonLd', () => {
  test('describes the project as a CreativeWork by the profile owner', () => {
    const project = {
      slug: 'kafka-golang-microservices',
      title: 'Kafka microservices',
      summary: 'Event-driven services.',
      coverImage: { src: '/uploads/kafka.png', alt: 'Kafka' },
      tags: TAGS,
    } as Project;

    expect(buildProjectJsonLd(project, PROFILE, SITE_URL)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: 'Kafka microservices',
      description: 'Event-driven services.',
      url: 'https://edgar-ferreira.com/project/kafka-golang-microservices/',
      image: 'https://edgar-ferreira.com/uploads/kafka.png',
      keywords: ['Kafka', 'Go'],
      author: AUTHOR,
    });
  });
});
