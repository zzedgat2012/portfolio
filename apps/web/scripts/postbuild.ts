// Architecture D4: runs after `next build` (see the `build` script in package.json).
// Each step is a `PostbuildStep`; story 3.1 adds the `_redirects` writer to POSTBUILD_STEPS.
// Any failing step fails the build with exit code 1.
import path from 'node:path';
import { cvPdfStep } from './cv-pdf-step';
import type { PostbuildStep } from './postbuild-steps';
import { runPostbuildSteps } from './postbuild-steps';

const OUT_DIR = path.resolve(import.meta.dirname, '../out');

const POSTBUILD_STEPS: readonly PostbuildStep[] = [cvPdfStep];

try {
  await runPostbuildSteps(POSTBUILD_STEPS, { outDir: OUT_DIR }, (line) => console.log(line));
} catch (error) {
  console.error(error);
  process.exit(1);
}
