import Link from 'next/link';
import { Container } from '@/shared/ui';
import { SiteNav } from './SiteNav';

type SiteHeaderProps = { siteName: string };

/** Wordmark (the name in Fira Code bold, no logo) + main navigation. */
export function SiteHeader({ siteName }: SiteHeaderProps) {
  return (
    <header className="relative">
      <Container className="flex h-20 items-center justify-between">
        <Link href="/" className="font-mono text-xl font-bold text-foreground">
          {siteName}
        </Link>
        <SiteNav />
      </Container>
    </header>
  );
}
