import type { Metadata } from 'next';
import { NotFoundView } from '@/features/site-shell';

// Exported as out/404.html; Cloudflare serves it with status 404 (wrangler.jsonc `404-page`).
export const metadata: Metadata = { title: 'Page not found' };

export default function NotFoundRoute() {
  return <NotFoundView />;
}
