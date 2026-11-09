/** A schema.org JSON-LD object. */
export type JsonLd = Readonly<Record<string, unknown>>;

/**
 * JSON for the body of a `<script type="application/ld+json">`. Every `<` becomes `<` (still
 * the same JSON string), so no value can close the script element or open a comment.
 */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
