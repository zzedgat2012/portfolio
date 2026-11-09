import { type ReactNode, ViewTransition } from 'react';
import { getProfile } from '@/features/profile';
import { SiteFooter, SiteHeader } from '@/features/site-shell';
import { SkipLink } from '@/shared/ui';

const MAIN_CONTENT_ID = 'main-content';

/**
 * Shell of every site page: skip link, header, `<main>`, footer. Pages render inside `<main>`, in
 * the page view transition; the header has its own `site-header` name, so it stays still.
 */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const profile = await getProfile();

  return (
    <>
      <SkipLink targetId={MAIN_CONTENT_ID}>Skip to content</SkipLink>
      <SiteHeader siteName={profile.name} />
      <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 focus:outline-none">
        {/* Soft navigations are transitions, so the page content runs the `.page` view transition
            (globals.css); browsers without View Transitions swap it instantly. The wrapper `div`
            gives React one element to name: without it each top-level section of a page gets its
            own view-transition name and fades on its own instead of the page moving as one. */}
        <ViewTransition default="page">
          <div>{children}</div>
        </ViewTransition>
      </main>
      {/* Static export: the year is the build year; every publish rebuilds the site. */}
      <SiteFooter ownerName={profile.name} year={new Date().getFullYear()} />
    </>
  );
}
