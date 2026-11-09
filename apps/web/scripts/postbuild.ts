// Architecture D4: runs after `next build` (see the `build` script in package.json).
// Each step is a `PostbuildStep`: `_redirects` first (story 3.1), then the CV PDF (story 2.5).
// Any failing step fails the build with exit code 1.
import path from 'node:path';
import { cvPdfStep } from './cv-pdf-step';
import type { PostbuildStep } from './postbuild-steps';
import { runPostbuildSteps } from './postbuild-steps';
import { redirectsStep } from './redirects-step';

const OUT_DIR = path.resolve(import.meta.dirname, '../out');

const POSTBUILD_STEPS: readonly PostbuildStep[] = [redirectsStep, cvPdfStep];

try {
  await runPostbuildSteps(POSTBUILD_STEPS, { outDir: OUT_DIR }, (line) => console.log(line));
} catch (error) {
  console.error(error);
  process.exit(1);
}
