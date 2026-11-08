import { expect, test } from 'vitest';
import { toReadingTimeLabel } from './reading-time-label';

test('[story 2.4] toReadingTimeLabel renders minutes as in the Artigo mockup', () => {
  expect(toReadingTimeLabel(15)).toBe('15 min');
  expect(toReadingTimeLabel(1)).toBe('1 min');
});
