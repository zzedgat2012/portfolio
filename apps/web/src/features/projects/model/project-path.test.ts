import { expect, test } from 'vitest';
import { buildProjectPath } from './project-path';

test('[story 2.2] buildProjectPath follows the WordPress URL with a trailing slash (D1)', () => {
  expect(buildProjectPath('kafka-golang-microservices')).toBe(
    '/project/kafka-golang-microservices/',
  );
});
