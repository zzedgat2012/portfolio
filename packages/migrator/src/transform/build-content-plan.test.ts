import { fileURLToPath } from 'node:url';
import {
  articleFileSchema,
  profileFileSchema,
  projectFileSchema,
  siteSettingsFileSchema,
  tagFileSchema,
  ValidationError,
} from '@portfolio/contracts';
import { describe, expect, test } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { readSnapshotDir } from '../source';
import { buildContentPlan, type ContentPlan } from './build-content-plan';

const FIXTURES_DIR = fileURLToPath(new URL('../../fixtures', import.meta.url));
const snapshot = await readSnapshotDir(FIXTURES_DIR);
const plan = buildContentPlan(snapshot);

function findEntry(collection: string, slug: string) {
  const entry = plan.entries.find((item) => item.collection === collection && item.slug === slug);
  if (!entry) {
    throw new Error(`no planned ${collection}/${slug}`);
  }
  return entry;
}

function splitFrontmatter(contents: string): { data: unknown; body: string } {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(contents);
  if (!match) {
    throw new Error('not a frontmatter document');
  }
  return { data: parseYaml(match[1] ?? ''), body: match[2] ?? '' };
}

function findFile(target: ContentPlan, path: string): string {
  const file = target.files.find((item) => item.path === path);
  if (!file) {
    throw new Error(`no planned ${path}`);
  }
  return file.contents;
}

describe('[story 1.2] buildContentPlan (recorded WordPress snapshot)', () => {
  test('plans 3 projects, 5 articles and the 26 tags of both taxonomies merged by slug', () => {
    const count = (collection: string) =>
      plan.entries.filter((entry) => entry.collection === collection).length;
    expect(count('projects')).toBe(3);
    expect(count('articles')).toBe(5);
    expect(count('tags')).toBe(26);
    expect(findEntry('tags', 'pl-sql').contents).toBe('name: PL/SQL\n');
    expect(findEntry('tags', 'node-js').contents).toBe('name: Node.js\n');
  });

  test('maps a project from REST + its rendered page', () => {
    const entry = findEntry('projects', 'kafka-golang-microservices');
    expect(entry.legacyWpId).toBe(8);
    const { data, body } = splitFrontmatter(entry.contents);
    expect(projectFileSchema.parse(data)).toEqual({
      title: 'The simplest example is kafka + golang',
      summary:
        'This article presents a simple way to implement a microservice architecture using Kafka, Golang and Docker.',
      coverImage: '/uploads/photo-1618761714954-0b8cd0026356.jpg',
      coverImageAlt: 'The simplest example is kafka + golang',
      tags: ['golang', 'kafka', 'docker'],
      technologies: ['Golang', 'Kafka', 'Docker', 'gRPC', 'PostgreSQL'],
      features: [
        'Complete microservice architecture setup',
        'Kafka message broker integration',
        'Docker containerization for easy deployment',
        'Service-to-service communication patterns',
        'Scalable and maintainable code structure',
      ],
      sortOrder: 1,
      isFeatured: true,
      legacyWpId: 8,
    });
    expect(body).toMatch(/^This project complete serves as my microservices/);
    expect(body.endsWith('Golang, and Docker.\n')).toBe(true);
  });

  test('orders projects by WordPress menu_order', () => {
    const sortOrders = ['kafka-golang-microservices', 'ecommerce-platform', 'task-management'].map(
      (slug) =>
        projectFileSchema.parse(splitFrontmatter(findEntry('projects', slug).contents).data)
          .sortOrder,
    );
    expect(sortOrders).toEqual([1, 2, 3]);
  });

  test('maps a post to an article with decoded title, date, tags and a Markdown body', () => {
    const entry = findEntry('articles', 'oracle-apex-cloudflare-proxy-oauth');
    const { data, body } = splitFrontmatter(entry.contents);
    const article = articleFileSchema.parse(data);
    expect(article).toMatchObject({
      title: 'Oracle APEX on OCI: Custom Domain & Custom OAuth with Cloudflare Workers',
      publishedOn: '2025-12-19',
      tags: ['cloudflare', 'oauth2', 'oci', 'oracle-apex', 'pl-sql', 'security'],
      legacyWpId: 14,
    });
    expect(article.summary).toMatch(/^A comprehensive guide to running Oracle APEX on OCI/);
    expect('coverImage' in article).toBe(false);
    expect(body).toMatch(/^## Introduction\n\n/);
    expect(body).toContain('```javascript\n');
    expect(body).toContain('```sql\n');
    expect(body).not.toContain('<');
  });

  test('every planned entry and file is valid against the contracts schemas', () => {
    const schemas = {
      projects: projectFileSchema,
      articles: articleFileSchema,
      tags: tagFileSchema,
    } as const;
    for (const entry of plan.entries) {
      const data =
        entry.collection === 'tags'
          ? parseYaml(entry.contents)
          : splitFrontmatter(entry.contents).data;
      expect(schemas[entry.collection].safeParse(data).success, entry.slug).toBe(true);
    }
    expect(
      profileFileSchema.safeParse(parseYaml(findFile(plan, 'settings/profile.yml'))).success,
    ).toBe(true);
  });

  test('writes site settings with the WordPress name and URL and a description', () => {
    const site = siteSettingsFileSchema.parse(parseYaml(findFile(plan, 'settings/site.yml')));
    expect(site.siteName).toBe('Edgar Ferreira');
    expect(site.siteUrl).toBe('https://edgar-ferreira.com');
    expect(site.description).toBe(
      'Edgar Ferreira, a product engineer from Aracaju, Brazil, dedicated to crafting experiences that connect strategy, design, and technology.',
    );
  });

  test('points the profile portrait at the downloaded upload', () => {
    const profile = profileFileSchema.parse(parseYaml(findFile(plan, 'settings/profile.yml')));
    expect(profile.portrait).toBe('/uploads/profile.jpg');
    expect(profile.portraitAlt).toBe('Portrait of Edgar Ferreira');
  });

  test('plans every media item under its original file name, and the required redirects', () => {
    expect(plan.media.map((item) => item.fileName).sort()).toEqual([
      'cropped-favicon.png',
      'favicon.png',
      'photo-1454165804606-c3d57bc86b40.jpg',
      'photo-1557821552-17105176677c.jpg',
      'photo-1618761714954-0b8cd0026356.jpg',
      'profile.jpg',
    ]);
    expect(plan.redirects).toEqual([
      { from: '/wp-sitemap.xml', to: '/sitemap.xml', status: 301 },
      { from: '/feed/', to: '/feed.xml', status: 301 },
    ]);
  });

  test('throws a ValidationError naming the record when a record is invalid', () => {
    const broken = {
      ...snapshot,
      projects: snapshot.projects.map((project) =>
        project.slug === 'task-management' ? { ...project, featured_media: 0 } : project,
      ),
    };
    expect(() => buildContentPlan(broken)).toThrow(ValidationError);
    expect(() => buildContentPlan(broken)).toThrow(/projects\/task-management/);
  });
});
