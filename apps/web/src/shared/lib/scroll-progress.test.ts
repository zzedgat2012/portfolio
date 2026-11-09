import { describe, expect, test } from 'vitest';
import { toScrollProgress } from './scroll-progress';

describe('[story 4.1] toScrollProgress', () => {
  test('is 0 at the top of the page', () => {
    expect(toScrollProgress(0, 2000, 500)).toBe(0);
  });

  test('is 1 at the bottom of the page', () => {
    expect(toScrollProgress(1500, 2000, 500)).toBe(1);
  });

  test('is the scrolled fraction in between', () => {
    expect(toScrollProgress(750, 2000, 500)).toBe(0.5);
  });

  test('is 0 when the page does not scroll', () => {
    expect(toScrollProgress(0, 500, 500)).toBe(0);
    expect(toScrollProgress(0, 400, 500)).toBe(0);
  });

  test('clamps overscroll to 0–1', () => {
    expect(toScrollProgress(-40, 2000, 500)).toBe(0);
    expect(toScrollProgress(1600, 2000, 500)).toBe(1);
  });
});
