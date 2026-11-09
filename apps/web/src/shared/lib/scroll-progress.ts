/**
 * Fraction of the document scrolled, from 0 (top) to 1 (bottom). A page that does not scroll is
 * at 0, and overscroll (negative or past the end, as on touch devices) is clamped to 0–1.
 */
export function toScrollProgress(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
): number {
  const maxScroll = scrollHeight - clientHeight;
  if (maxScroll <= 0) {
    return 0;
  }
  return Math.min(1, Math.max(0, scrollTop / maxScroll));
}
