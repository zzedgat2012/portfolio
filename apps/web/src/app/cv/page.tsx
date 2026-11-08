import type { Metadata } from 'next';
import { CvSheet, toCv } from '@/features/cv';
import { getProfile } from '@/features/profile';
import { getSiteSettings } from '@/features/settings';
import { buildPageMetadata } from '@/shared/lib';
import './print.css';

const PAGE_TITLE = 'CV';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    ...buildPageMetadata({ title: PAGE_TITLE, description: null, siteName: settings.siteName }),
    // The PDF is the public artifact; the print page itself stays out of search results.
    robots: { index: false },
  };
}

/**
 * `/cv/` (story 2.5): printable CV outside the `(site)` shell (no header, nav or footer), in the
 * light print theme. `scripts/postbuild.ts` renders it to `/edgar-ferreira-cv.pdf`.
 */
export default async function CvRoute() {
  const [profile, settings] = await Promise.all([getProfile(), getSiteSettings()]);

  return (
    <main data-theme="print" className="flex-1 bg-background text-foreground">
      <CvSheet cv={toCv(profile, settings)} />
    </main>
  );
}
