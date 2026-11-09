import { describe, expect, test } from 'vitest';
import { buildPageMetadata, buildPageTitle } from './build-page-metadata';

const SITE = { siteName: 'Edgar Ferreira', siteUrl: 'https://edgar-ferreira.com' };
const COVER = { src: '/uploads/kafka.png', alt: 'Kafka diagram' };

test('[story 2.3] buildPageTitle appends the site name after a pipe', () => {
  expect(buildPageTitle('The simplest example is kafka + golang', 'Edgar Ferreira')).toBe(
    'The simplest example is kafka + golang | Edgar Ferreira',
  );
});

describe('[story 3.1] buildPageMetadata', () => {
  test('sets the absolute title, description, canonical, Open Graph and Twitter card', () => {
    expect(
      buildPageMetadata({
        ...SITE,
        title: 'E-commerce Platform',
        description: 'Modern e-commerce solution.',
        path: '/project/ecommerce-platform/',
        image: COVER,
      }),
    ).toEqual({
      title: { absolute: 'E-commerce Platform | Edgar Ferreira' },
      description: 'Modern e-commerce solution.',
      alternates: { canonical: 'https://edgar-ferreira.com/project/ecommerce-platform/' },
      openGraph: {
        type: 'website',
        locale: 'en_US',
        siteName: 'Edgar Ferreira',
        url: 'https://edgar-ferreira.com/project/ecommerce-platform/',
        title: 'E-commerce Platform | Edgar Ferreira',
        description: 'Modern e-commerce solution.',
        images: [{ url: 'https://edgar-ferreira.com/uploads/kafka.png', alt: 'Kafka diagram' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'E-commerce Platform | Edgar Ferreira',
        description: 'Modern e-commerce solution.',
        images: [{ url: 'https://edgar-ferreira.com/uploads/kafka.png', alt: 'Kafka diagram' }],
      },
    });
  });

  test('uses the bare site name as the title of the home page (title null)', () => {
    const metadata = buildPageMetadata({
      ...SITE,
      title: null,
      description: null,
      path: '/',
      image: null,
    });

    expect(metadata.title).toEqual({ absolute: 'Edgar Ferreira' });
    expect(metadata.alternates).toEqual({ canonical: 'https://edgar-ferreira.com/' });
    expect(metadata.openGraph).toMatchObject({ title: 'Edgar Ferreira' });
  });

  test('leaves the description and images out when there are none, with a small card', () => {
    const metadata = buildPageMetadata({
      ...SITE,
      title: 'CV',
      description: null,
      path: '/cv/',
      image: null,
    });

    expect(metadata).not.toHaveProperty('description');
    expect(metadata.openGraph).not.toHaveProperty('description');
    expect(metadata.openGraph).not.toHaveProperty('images');
    expect(metadata.twitter).toEqual({ card: 'summary', title: 'CV | Edgar Ferreira' });
  });

  test('marks a page with a publication date as an Open Graph article', () => {
    const metadata = buildPageMetadata({
      ...SITE,
      title: 'Modern CSS',
      description: 'Techniques.',
      path: '/article/modern-css/',
      image: COVER,
      publishedOn: '2025-12-19',
    });

    expect(metadata.openGraph).toMatchObject({ type: 'article', publishedTime: '2025-12-19' });
  });
});
