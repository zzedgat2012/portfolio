import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

type BackLinkProps = { href: string; children: ReactNode; className?: string };

/** Ghost button with `arrow-left` ("Back to projects", "Back to articles"), Projeto/Artigo mockups. */
export function BackLink({ href, children, className }: BackLinkProps) {
  return (
    <Link
      href={href}
      className={[
        'inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-secondary/60',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <ArrowLeft size={16} aria-hidden="true" />
      {children}
    </Link>
  );
}
