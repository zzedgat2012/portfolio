import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

type ArrowPillLinkProps = {
  href: string;
  /** Visible text ("Read more"). */
  children: ReactNode;
  /** Appended for screen readers only, so repeated "Read more" links stay distinct. */
  srSuffix?: string;
  className?: string;
};

/**
 * pill-link (DESIGN.md › Components): white "Read more" pill + 48px white circle with
 * `arrow-right`. Both are one link, so there is a single tab stop and a single name.
 */
export function ArrowPillLink({ href, children, srSuffix, className }: ArrowPillLinkProps) {
  return (
    <Link
      href={href}
      className={['group inline-flex items-center gap-3', className].filter(Boolean).join(' ')}
    >
      <span className="rounded-full bg-pill px-6 py-3 text-sm font-medium text-background transition-colors duration-150 group-hover:bg-pill-hover">
        {children}
        {srSuffix ? <span className="sr-only"> {srSuffix}</span> : null}
      </span>
      <span
        aria-hidden="true"
        className="grid size-12 place-items-center rounded-full bg-pill text-background transition-colors duration-150 group-hover:bg-pill-hover"
      >
        <ArrowRight size={16} />
      </span>
    </Link>
  );
}
