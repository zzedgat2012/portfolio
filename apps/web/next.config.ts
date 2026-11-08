import type { NextConfig } from 'next';

/**
 * Static export (out/), served by Cloudflare Workers static assets (wrangler.jsonc).
 * No server at runtime: no redirects()/rewrites(), middleware, API routes or image optimizer.
 */
const nextConfig: NextConfig = {
  output: 'export',
  // D1: URLs end in `/` like WordPress; the export writes <route>/index.html.
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
