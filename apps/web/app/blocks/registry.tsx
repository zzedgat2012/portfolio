import type { ReactNode } from 'react';
import type { Block } from '@/features/pages';
import { assertNever } from '@/shared/lib';

/**
 * Maps a dynamic-zone block to its React component.
 * The switch is exhaustive: adding a new Block member without a case
 * is a compile error (the `default` falls through to `assertNever`).
 */
export function renderBlock(block: Block): ReactNode {
  switch (block) {
    default:
      return assertNever(block);
  }
}
