import type { JsonLd as JsonLdData } from '@/shared/lib';
import { serializeJsonLd } from '@/shared/lib';

/**
 * Structured data for search engines (story 3.1). The JSON is the script's text child, with every
 * `<` escaped by `serializeJsonLd`, so no `dangerouslySetInnerHTML` is needed.
 */
export function JsonLd({ data }: { data: JsonLdData }) {
  return <script type="application/ld+json">{serializeJsonLd(data)}</script>;
}
