import type { ReactNode } from 'react';

type ContainerProps = { children: ReactNode; className?: string };

/** Page-width wrapper (DESIGN.md › Layout): 1152px max, 16px gutter on mobile, 32px from md. */
export function Container({ children, className }: ContainerProps) {
  return (
    <div className={['mx-auto w-full max-w-6xl px-4 md:px-8', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
