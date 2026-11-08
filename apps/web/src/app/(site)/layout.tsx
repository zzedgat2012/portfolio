import type { ReactNode } from 'react';
import { getProfile } from '@/features/profile';
import { SiteFooter, SiteHeader } from '@/features/site-shell';
import { SkipLink } from '@/shared/ui';

const MAIN_CONTENT_ID = 'main-content';

/** Shell of every site page: skip link, header, `<main>`, footer. Pages render inside `<main>`. */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const profile = await getProfile();

  return (
    <>
      <SkipLink targetId={MAIN_CONTENT_ID}>Skip to content</SkipLink>
      <SiteHeader siteName={profile.name} />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      {/* Static export: the year is the build year; every publish rebuilds the site. */}
      <SiteFooter ownerName={profile.name} year={new Date().getFullYear()} />
    </>
  );
}
