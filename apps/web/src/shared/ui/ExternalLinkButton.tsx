import type { ReactNode } from 'react';

type ExternalLinkButtonProps = {
  href: string;
  /** button-primary (filled) or button-outline (DESIGN.md › Components). */
  variant: 'primary' | 'outline';
  /** Decorative icon placed before the label. */
  icon?: ReactNode;
  children: ReactNode;
};

const VARIANT_CLASSES: Record<ExternalLinkButtonProps['variant'], string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  outline:
    'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
};

/** A 40px button-styled link that opens an external site in a new tab, without `window.opener`. */
export function ExternalLinkButton({ href, variant, icon, children }: ExternalLinkButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-medium transition-colors duration-150 ${VARIANT_CLASSES[variant]}`}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </a>
  );
}
