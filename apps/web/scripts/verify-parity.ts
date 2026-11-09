// Story 3.1 AC6: `pnpm --filter web verify:parity <baseUrl>`
// Checks every path of scripts/legacy-urls.txt (recorded from the old WordPress wp-sitemap.xml)
// against <baseUrl>; exits 1 unless each answers 200, or a 301/308 to a 200.
import { readFile } from 'node:fs/promises';
import { checkParity, formatParityReport, parseLegacyPaths } from './parity-check';

const LEGACY_URLS_FILE = new URL('./legacy-urls.txt', import.meta.url);

const baseUrl = process.argv[2];
if (!baseUrl || !URL.canParse(baseUrl)) {
  console.error('usage: pnpm --filter web verify:parity <baseUrl>   (e.g. http://127.0.0.1:3200)');
  process.exit(2);
}

const paths = parseLegacyPaths(await readFile(LEGACY_URLS_FILE, 'utf8'));
const results = await checkParity(baseUrl, paths, (url, init) => fetch(url, init));
console.log(`Parity against ${baseUrl}\n`);
console.log(formatParityReport(results));
process.exit(results.every((result) => result.isOk) ? 0 : 1);
