import type { ProjectFile } from '@portfolio/contracts';
import { describe, expect, test } from 'vitest';
import { buildTagIndex } from '@/features/tags';
import { toProject } from './project-mapper';

const tagIndex = buildTagIndex([{ slug: 'golang', name: 'Golang' }]);

const data: ProjectFile = {
  title: 'Kafka + Golang',
  summary: 'A template.',
  coverImage: '/uploads/kafka.png',
  coverImageAlt: 'Diagram',
  tags: ['golang'],
  technologies: ['Go'],
  features: ['Fast'],
  sortOrder: 3,
  isFeatured: true,
  legacyWpId: 9,
};

describe('[story 1.1] toProject', () => {
  test('maps the entry, resolving tags and dropping legacyWpId', () => {
    const project = toProject({ slug: 'kafka', data, body: 'Overview' }, tagIndex);

    expect(project).toEqual({
      slug: 'kafka',
      title: 'Kafka + Golang',
      summary: 'A template.',
      coverImage: { src: '/uploads/kafka.png', alt: 'Diagram' },
      tags: [{ slug: 'golang', name: 'Golang' }],
      technologies: ['Go'],
      features: ['Fast'],
      demoUrl: null,
      codeUrl: null,
      sortOrder: 3,
      isFeatured: true,
      overview: 'Overview',
    });
    expect(project).not.toHaveProperty('legacyWpId');
  });

  test('keeps demo and code URLs when present', () => {
    const project = toProject(
      {
        slug: 'kafka',
        data: { ...data, demoUrl: 'https://d.example', codeUrl: 'https://c.example' },
        body: '',
      },
      tagIndex,
    );

    expect(project).toMatchObject({ demoUrl: 'https://d.example', codeUrl: 'https://c.example' });
  });
});
