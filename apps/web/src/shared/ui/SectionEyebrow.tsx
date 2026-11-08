import type { ReactNode } from 'react';

type SectionEyebrowProps = { id: string; children: ReactNode; className?: string };

/** Section title as a spaced caps eyebrow (DESIGN.md › section-eyebrow), left-aligned. */
export function SectionEyebrow({ id, children, className }: SectionEyebrowProps) {
  return (
    <h2
      id={id}
      className={['font-mono text-xs tracking-eyebrow text-muted-foreground uppercase', className]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </h2>
  );
}
