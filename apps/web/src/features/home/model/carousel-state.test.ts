import { describe, expect, test } from 'vitest';
import {
  buildSlideLabel,
  toNextSlideIndex,
  toPreviousSlideIndex,
  toSlideIndexForKey,
} from './carousel-state';

describe('[story 2.2] carousel state', () => {
  test('toNextSlideIndex advances and wraps to the first slide', () => {
    expect(toNextSlideIndex(0, 3)).toBe(1);
    expect(toNextSlideIndex(2, 3)).toBe(0);
    expect(toNextSlideIndex(0, 1)).toBe(0);
  });

  test('toPreviousSlideIndex goes back and wraps to the last slide', () => {
    expect(toPreviousSlideIndex(1, 3)).toBe(0);
    expect(toPreviousSlideIndex(0, 3)).toBe(2);
    expect(toPreviousSlideIndex(0, 1)).toBe(0);
  });

  test('toSlideIndexForKey maps arrows, Home and End, and ignores other keys', () => {
    expect(toSlideIndexForKey('ArrowRight', 0, 3)).toBe(1);
    expect(toSlideIndexForKey('ArrowLeft', 0, 3)).toBe(2);
    expect(toSlideIndexForKey('Home', 2, 3)).toBe(0);
    expect(toSlideIndexForKey('End', 0, 3)).toBe(2);
    expect(toSlideIndexForKey('Enter', 0, 3)).toBeNull();
  });

  test('buildSlideLabel names a slide by its 1-based position', () => {
    expect(buildSlideLabel(0, 3)).toBe('1 of 3');
    expect(buildSlideLabel(2, 3)).toBe('3 of 3');
  });
});
