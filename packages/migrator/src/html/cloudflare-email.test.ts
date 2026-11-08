import { describe, expect, test } from 'vitest';
import { decodeCloudflareEmail } from './cloudflare-email';

describe('[story 1.2] decodeCloudflareEmail', () => {
  test('decodes the XOR-encoded hex Cloudflare puts in data-cfemail and #fragments', () => {
    expect(decodeCloudflareEmail('640102170a5c5c240309050d084a070b09')).toBe('efsn88@gmail.com');
    expect(decodeCloudflareEmail('8cefe3e2f8edf8e3cce9e8ebedfea1eae9fefee9e5feeda2efe3e1')).toBe(
      'contato@edgar-ferreira.com',
    );
  });

  test('rejects input that is not even-length hex', () => {
    expect(() => decodeCloudflareEmail('xyz')).toThrow();
  });
});
