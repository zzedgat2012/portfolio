/**
 * Branded type for Strapi `documentId`.
 *
 * The frontend uses `documentId` (never the numeric `id`) as the public
 * identifier. Branding prevents accidentally passing a plain string where
 * a `DocumentId` is expected.
 */
export type DocumentId = string & { readonly __brand: 'DocumentId' };

/** Cast a string to a branded `DocumentId` (runtime no-op). */
export function asDocumentId(value: string): DocumentId {
  return value as DocumentId;
}
