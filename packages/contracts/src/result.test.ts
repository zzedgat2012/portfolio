import { describe, expect, test } from 'vitest';
import { err, isErr, isOk, ok } from './result';

describe('Result', () => {
  test('ok creates a success result', () => {
    const result = ok(42);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(42);
    }
  });

  test('err creates a failure result', () => {
    const result = err('something went wrong');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('something went wrong');
    }
  });

  test('isOk returns true for success', () => {
    expect(isOk(ok('hello'))).toBe(true);
  });

  test('isOk returns false for failure', () => {
    expect(isOk(err('fail'))).toBe(false);
  });

  test('isErr returns true for failure', () => {
    expect(isErr(err('fail'))).toBe(true);
  });

  test('isErr returns false for success', () => {
    expect(isErr(ok('hello'))).toBe(false);
  });
});
