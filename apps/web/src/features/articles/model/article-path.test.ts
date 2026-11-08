import { expect, test } from 'vitest';
import { buildArticlePath } from './article-path';

test('[story 2.2] buildArticlePath follows the WordPress URL with a trailing slash (D1)', () => {
  expect(buildArticlePath('modern-css')).toBe('/article/modern-css/');
});
