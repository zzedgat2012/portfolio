import { describe, expect, test } from 'vitest';
import { listTags } from './tag-queries';

describe('[story 1.1] listTags', () => {
  test('lists every tag sorted by name', async () => {
    expect(await listTags()).toEqual([
      { slug: 'seed-golang', name: 'Golang' },
      { slug: 'seed-kafka', name: 'Kafka' },
      { slug: 'seed-oracle-apex', name: 'Oracle APEX' },
      { slug: 'seed-typescript', name: 'TypeScript' },
    ]);
  });
});
