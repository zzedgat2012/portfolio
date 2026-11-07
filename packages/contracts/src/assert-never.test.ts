import { describe, expect, test } from 'vitest';
import { assertNever } from './assert-never';

describe('assertNever', () => {
  test('throws when called', () => {
    expect(() => assertNever('unexpected' as never)).toThrow();
  });

  test('includes the value in the error message', () => {
    expect(() => assertNever('unexpected' as never)).toThrow(/unexpected/);
  });
});
