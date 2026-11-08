import { expect, test } from 'vitest';
import { buildPageMetadata, buildPageTitle } from './build-page-metadata';

test('[story 2.3] buildPageTitle appends the site name after a pipe', () => {
  expect(buildPageTitle('The simplest example is kafka + golang', 'Edgar Ferreira')).toBe(
    'The simplest example is kafka + golang | Edgar Ferreira',
  );
});

test('[story 2.3] buildPageMetadata sets an absolute title and the description', () => {
  expect(
    buildPageMetadata({
      title: 'E-commerce Platform',
      description: 'Modern e-commerce solution.',
      siteName: 'Edgar Ferreira',
    }),
  ).toEqual({
    title: { absolute: 'E-commerce Platform | Edgar Ferreira' },
    description: 'Modern e-commerce solution.',
  });
});

test('[story 2.3] buildPageMetadata leaves the description out when there is none', () => {
  expect(buildPageMetadata({ title: 'CV', description: null, siteName: 'Edgar Ferreira' })).toEqual(
    { title: { absolute: 'CV | Edgar Ferreira' } },
  );
});
