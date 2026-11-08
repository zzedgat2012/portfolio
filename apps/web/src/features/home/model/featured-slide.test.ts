import { expect, test } from 'vitest';
import type { Project } from '@/features/projects';
import { toFeaturedSlide } from './featured-slide';

const PROJECT: Project = {
  slug: 'kafka-golang',
  title: 'Kafka + Golang',
  summary: 'A microservice template.',
  coverImage: { src: '/uploads/kafka.png', alt: 'Kafka diagram' },
  tags: [
    { slug: 'golang', name: 'Golang' },
    { slug: 'kafka', name: 'Kafka' },
  ],
  technologies: ['Go'],
  features: ['Fast'],
  demoUrl: null,
  codeUrl: null,
  sortOrder: 1,
  isFeatured: true,
  overview: 'Body',
};

test('[story 2.2] toFeaturedSlide keeps only what a carousel slide shows', () => {
  expect(toFeaturedSlide(PROJECT)).toEqual({
    slug: 'kafka-golang',
    href: '/project/kafka-golang/',
    title: 'Kafka + Golang',
    summary: 'A microservice template.',
    tags: ['Golang', 'Kafka'],
    cover: { src: '/uploads/kafka.png', alt: 'Kafka diagram' },
  });
});
