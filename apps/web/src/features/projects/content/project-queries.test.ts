import { NotFoundError } from '@portfolio/contracts';
import { describe, expect, test } from 'vitest';
import { getProjectBySlug, listFeaturedProjects, listProjects } from './project-queries';

describe('[story 1.1] project queries', () => {
  test('listProjects returns every project by sortOrder ascending', async () => {
    const projects = await listProjects();

    expect(projects.map((project) => project.slug)).toEqual([
      'seed-project-without-links',
      'seed-featured-project',
      'seed-second-featured-project',
    ]);
  });

  test('getProjectBySlug returns the project with resolved tags and its overview', async () => {
    const project = await getProjectBySlug('seed-featured-project');

    expect(project).toMatchObject({
      title: 'Seed featured project',
      tags: [
        { slug: 'seed-golang', name: 'Golang' },
        { slug: 'seed-kafka', name: 'Kafka' },
      ],
      demoUrl: 'https://demo.example.com/seed-featured-project',
      isFeatured: true,
    });
    expect(project.overview).toContain('The **overview** of the seed featured project.');
  });

  test('getProjectBySlug throws NotFoundError for an unknown slug', async () => {
    await expect(getProjectBySlug('missing')).rejects.toThrow(NotFoundError);
  });

  test('listFeaturedProjects returns only featured projects', async () => {
    expect((await listFeaturedProjects()).map((project) => project.slug)).toEqual([
      'seed-featured-project',
      'seed-second-featured-project',
    ]);
  });
});
