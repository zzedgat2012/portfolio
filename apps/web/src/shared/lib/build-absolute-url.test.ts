import { expect, test } from 'vitest';
import { buildAbsoluteUrl } from './build-absolute-url';

test('[story 2.4] buildAbsoluteUrl joins the site origin and a route path', () => {
  expect(buildAbsoluteUrl('https://edgar-ferreira.com', '/article/modern-css/')).toBe(
    'https://edgar-ferreira.com/article/modern-css/',
  );
});

test('[story 2.4] buildAbsoluteUrl tolerates a trailing slash on the origin', () => {
  expect(buildAbsoluteUrl('https://edgar-ferreira.com/', '/article/a/')).toBe(
    'https://edgar-ferreira.com/article/a/',
  );
});
