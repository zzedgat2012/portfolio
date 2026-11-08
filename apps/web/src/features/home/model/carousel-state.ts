// Pure state transitions of the featured-projects carousel (architecture D3: no autoplay).

export function toNextSlideIndex(index: number, count: number): number {
  return count === 0 ? 0 : (index + 1) % count;
}

export function toPreviousSlideIndex(index: number, count: number): number {
  return count === 0 ? 0 : (index - 1 + count) % count;
}

/** The slide a key press moves to, or `null` when the key does not drive the carousel. */
export function toSlideIndexForKey(key: string, index: number, count: number): number | null {
  switch (key) {
    case 'ArrowRight':
      return toNextSlideIndex(index, count);
    case 'ArrowLeft':
      return toPreviousSlideIndex(index, count);
    case 'Home':
      return 0;
    case 'End':
      return Math.max(count - 1, 0);
    default:
      return null;
  }
}

/** Accessible name of a slide: `1 of 3`. */
export function buildSlideLabel(index: number, count: number): string {
  return `${index + 1} of ${count}`;
}
