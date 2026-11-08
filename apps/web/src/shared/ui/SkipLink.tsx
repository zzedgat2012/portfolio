import type { ReactNode } from 'react';

type SkipLinkProps = { targetId: string; children: ReactNode };

/** First focusable element: hidden until focused, jumps to the main content. */
export function SkipLink({ targetId, children }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50"
    >
      {children}
    </a>
  );
}
