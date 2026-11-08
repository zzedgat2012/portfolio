import { AppError } from '@portfolio/contracts';

/** What every postbuild step gets: the static export directory written by `next build`. */
export type PostbuildContext = {
  /** Absolute path of `apps/web/out`. */
  outDir: string;
};

/** One composable step of `scripts/postbuild.ts` (architecture D4). */
export type PostbuildStep = {
  /** Short name used in the build log and in errors. */
  name: string;
  run: (context: PostbuildContext) => Promise<void>;
};

/** A postbuild step failed; the build must stop with a non-zero exit code. */
export class PostbuildStepError extends AppError {
  readonly stepName: string;

  constructor(stepName: string, cause: unknown) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    super(`postbuild step "${stepName}" failed: ${reason}`, 'POSTBUILD_STEP_FAILED');
    this.stepName = stepName;
    this.cause = cause;
  }
}

/** Runs the steps one after the other, logging each; stops at the first failure. */
export async function runPostbuildSteps(
  steps: readonly PostbuildStep[],
  context: PostbuildContext,
  log: (line: string) => void,
): Promise<void> {
  for (const step of steps) {
    log(`postbuild ▸ ${step.name}`);
    const startedAt = performance.now();
    try {
      await step.run(context);
    } catch (error) {
      throw new PostbuildStepError(step.name, error);
    }
    log(`postbuild ✓ ${step.name} (${Math.round(performance.now() - startedAt)} ms)`);
  }
}
