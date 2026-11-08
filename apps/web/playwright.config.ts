import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright runs against the static export served by `wrangler dev`, exactly as Cloudflare
 * serves it, built from the fixture content in e2e/content (never the real content/).
 * Port 3100 so a running `next dev` on :3000 is never mistaken for the test server.
 */
const PORT = 3100;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `pnpm build && pnpm exec wrangler dev --port ${PORT} --ip 127.0.0.1`,
    url: `http://localhost:${PORT}`,
    timeout: 180_000,
    reuseExistingServer: false,
    env: { CONTENT_DIR: 'e2e/content', WRANGLER_SEND_METRICS: 'false' },
  },
});
