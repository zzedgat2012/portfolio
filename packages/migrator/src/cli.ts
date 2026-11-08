import path from 'node:path';
import { parseArgs } from 'node:util';
import { type LoadReport, writeContentPlan } from './load';
import { downloadMedia, fetchSnapshot, readSnapshotDir } from './source';
import { buildContentPlan, type ContentPlan } from './transform';

/**
 * `pnpm --filter migrator migrate [--base-url https://edgar-ferreira.com] [--from <snapshot dir>]`
 *
 * Extracts the live WordPress site (or a recorded snapshot such as `fixtures/`), transforms it and
 * writes `content/` and `apps/web/public/uploads/`. Safe to re-run: unchanged files are not touched.
 */
const DEFAULT_BASE_URL = 'https://edgar-ferreira.com';
const REPO_ROOT = path.resolve(import.meta.dirname, '../../..');

const { values } = parseArgs({
  options: {
    'base-url': { type: 'string', default: DEFAULT_BASE_URL },
    from: { type: 'string' },
    'content-dir': { type: 'string', default: path.join(REPO_ROOT, 'content') },
    'uploads-dir': { type: 'string', default: path.join(REPO_ROOT, 'apps/web/public/uploads') },
  },
});

function printReport(plan: ContentPlan, report: LoadReport): void {
  const countEntries = (collection: string) =>
    plan.entries.filter((entry) => entry.collection === collection).length;
  console.log('Import report');
  console.log(`  projects: ${countEntries('projects')}`);
  console.log(`  articles: ${countEntries('articles')}`);
  console.log(`  tags:     ${countEntries('tags')}`);
  console.log(`  media:    ${plan.media.length}`);
  console.log(
    `  settings: ${plan.files.map((file) => file.path).join(', ')}, settings/redirects.yml`,
  );
  for (const [kind, paths] of Object.entries(report)) {
    console.log(
      `  ${kind}: ${paths.length}${paths.length > 0 && kind !== 'unchanged' ? ` (${paths.join(', ')})` : ''}`,
    );
  }
  for (const warning of plan.warnings) {
    console.warn(`  warning: ${warning}`);
  }
}

const snapshot = values.from
  ? await readSnapshotDir(path.resolve(values.from))
  : await fetchSnapshot(values['base-url']);
const plan = buildContentPlan(snapshot);
const report = await writeContentPlan(plan, {
  contentDir: values['content-dir'],
  uploadsDir: values['uploads-dir'],
  download: (url) => downloadMedia(url),
});
printReport(plan, report);
