import { describe, expect, test } from 'vitest';
import { serializeJsonLd } from './serialize-json-ld';

describe('[story 3.1] serializeJsonLd', () => {
  test('serializes the data as JSON', () => {
    expect(JSON.parse(serializeJsonLd({ '@type': 'Person', name: 'Edgar' }))).toEqual({
      '@type': 'Person',
      name: 'Edgar',
    });
  });

  test('escapes "<" so a value can never close the script element', () => {
    const json = serializeJsonLd({ headline: '</script><script>alert(1)</script>' });

    expect(json).not.toContain('<');
    expect(json).toContain('\\u003c/script>');
    expect(JSON.parse(json)).toEqual({ headline: '</script><script>alert(1)</script>' });
  });
});
