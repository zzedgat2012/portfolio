import Link from 'next/link';
import { Container } from '@/shared/ui';
import { SiteNav } from './SiteNav';

type SiteHeaderProps = { siteName: string };

/**
 * Wordmark (the name in Fira Code bold, no logo) + main navigation. Named `site-header` for View
 * Transitions, so page transitions leave it still (globals.css). The name makes the header a
 * stacking context, so it carries `z-40` itself: the mobile menu panel must stay above `<main>`.
 */
export function SiteHeader({ siteName }: SiteHeaderProps) {
  return (
    <header className="relative z-40 [view-transition-name:site-header]">
      <Container className="flex h-20 items-center justify-between">
        <Link href="/" className="font-mono text-xl font-bold text-foreground">
          {siteName}
        </Link>
        <SiteNav />
      </Container>
    </header>
  );
}
