import { describe, expect, test } from 'vitest';
import { buildArticleShareLinks } from './article-share';

const Url = 'https://edgar-ferreira.com/article/apex-oci/';

describe('[story 2.4] buildArticleShareLinks', () => {
  test('builds the Twitter/X intent with the encoded canonical URL and title', () => {
    const { twitter } = buildArticleShareLinks({ url: Url, title: 'APEX & OCI: a guide' });

    expect(twitter).toBe(
      'https://x.com/intent/tweet?url=https%3A%2F%2Fedgar-ferreira.com%2Farticle%2Fapex-oci%2F&text=APEX+%26+OCI%3A+a+guide',
    );
  });

  test('builds the LinkedIn share-offsite URL with the encoded canonical URL', () => {
    const { linkedIn } = buildArticleShareLinks({ url: Url, title: 'Anything' });

    expect(linkedIn).toBe(
      'https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fedgar-ferreira.com%2Farticle%2Fapex-oci%2F',
    );
  });
});
