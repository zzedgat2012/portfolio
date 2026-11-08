import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    // Query functions read the e2e fixture content, never the real content/.
    env: { CONTENT_DIR: fileURLToPath(new URL('./e2e/content', import.meta.url)) },
  },
});
