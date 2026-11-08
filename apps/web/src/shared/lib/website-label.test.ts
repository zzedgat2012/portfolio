import { describe, expect, test } from 'vitest';
import { toWebsiteLabel } from './website-label';

describe('[story 2.2] toWebsiteLabel', () => {
  test('drops the protocol and the trailing slash, keeps host and path', () => {
    expect(toWebsiteLabel('https://edgar-ferreira.com')).toBe('edgar-ferreira.com');
    expect(toWebsiteLabel('https://edgar-ferreira.com/')).toBe('edgar-ferreira.com');
    expect(toWebsiteLabel('http://example.com/path/')).toBe('example.com/path');
  });
});
