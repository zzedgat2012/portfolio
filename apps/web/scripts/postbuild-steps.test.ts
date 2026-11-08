import { describe, expect, test } from 'vitest';
import type { PostbuildStep } from './postbuild-steps';
import { PostbuildStepError, runPostbuildSteps } from './postbuild-steps';

const CONTEXT = { outDir: '/srv/out' };

function recordingStep(name: string, calls: string[], error?: Error): PostbuildStep {
  return {
    name,
    run: async (context) => {
      calls.push(`${name}:${context.outDir}`);
      if (error) {
        throw error;
      }
    },
  };
}

describe('[story 2.5] runPostbuildSteps', () => {
  test('runs every step in order with the shared context and logs each one', async () => {
    const calls: string[] = [];
    const logs: string[] = [];

    await runPostbuildSteps(
      [recordingStep('first', calls), recordingStep('second', calls)],
      CONTEXT,
      (line) => logs.push(line),
    );

    expect(calls).toEqual(['first:/srv/out', 'second:/srv/out']);
    expect(logs[0]).toBe('postbuild ▸ first');
    expect(logs[1]).toMatch(/^postbuild ✓ first \(\d+ ms\)$/);
    expect(logs[2]).toBe('postbuild ▸ second');
  });

  test('stops at the first failing step and names it in the error', async () => {
    const calls: string[] = [];
    const failure = new Error('chromium missing');

    const run = runPostbuildSteps(
      [
        recordingStep('first', calls),
        recordingStep('broken', calls, failure),
        recordingStep('never', calls),
      ],
      CONTEXT,
      () => {},
    );

    await expect(run).rejects.toThrow(PostbuildStepError);
    await expect(run).rejects.toThrow('postbuild step "broken" failed: chromium missing');
    await expect(run).rejects.toMatchObject({ stepName: 'broken', cause: failure });
    expect(calls).toEqual(['first:/srv/out', 'broken:/srv/out']);
  });
});
