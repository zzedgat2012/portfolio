import type { ReactNode } from 'react';
import type { Section } from '@/features/pages';
import { assertNever } from '@/shared/lib';

/**
 * Maps a page section to its block component.
 * The switch is exhaustive: adding a Section member without a case is a compile error.
 */
export function renderSection(section: Section): ReactNode {
  switch (section) {
    default:
      return assertNever(section);
  }
}
