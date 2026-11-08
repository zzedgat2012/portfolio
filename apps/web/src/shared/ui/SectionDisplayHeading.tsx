import type { ReactNode } from 'react';

type SectionDisplayHeadingProps = { id: string; children: ReactNode; className?: string };

/** Section title in display type, right-aligned (DESIGN.md › section-display). */
export function SectionDisplayHeading({ id, children, className }: SectionDisplayHeadingProps) {
  return (
    <h2
      id={id}
      className={[
        'text-right font-mono text-4xl leading-none font-bold tracking-tight text-foreground sm:text-6xl lg:text-8xl',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </h2>
  );
}
