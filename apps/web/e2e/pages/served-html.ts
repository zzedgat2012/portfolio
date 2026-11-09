import type { Response } from '@playwright/test';

const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&quot;': '"',
  '&#x27;': "'",
  '&#39;': "'",
  '&lt;': '<',
  '&gt;': '>',
};

function decodeEntities(value: string): string {
  return value.replace(
    /&(?:amp|quot|#x27|#39|lt|gt);/g,
    (entity) => HTML_ENTITIES[entity] ?? entity,
  );
}

/**
 * The `<head>` of a page as the server sent it. `<meta>`, `<link rel="canonical">` and JSON-LD
 * scripts have no ARIA role, so they are read from the served HTML instead of a locator.
 */
export class ServedHtml {
  private constructor(private readonly html: string) {}

  static async of(response: Response | null): Promise<ServedHtml> {
    if (!response) {
      throw new Error('navigation returned no response');
    }
    return new ServedHtml(await response.text());
  }

  /** `content` of `<meta name|property="key">`, or `null` when the page has none. */
  meta(key: string): string | null {
    const match = new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`).exec(this.html);
    return match?.[1] === undefined ? null : decodeEntities(match[1]);
  }

  canonicalUrl(): string | null {
    const match = /<link rel="canonical" href="([^"]*)"/.exec(this.html);
    return match?.[1] === undefined ? null : decodeEntities(match[1]);
  }

  documentLanguage(): string | null {
    return /<html[^>]* lang="([^"]*)"/.exec(this.html)?.[1] ?? null;
  }

  /** Every `<script type="application/ld+json">` body, parsed. */
  structuredData(): unknown[] {
    return [...this.html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(
      (match) => JSON.parse(match[1] ?? 'null') as unknown,
    );
  }
}
