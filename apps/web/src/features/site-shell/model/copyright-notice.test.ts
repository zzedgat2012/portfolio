import { describe, expect, it } from 'vitest';
import { buildCopyrightNotice } from './copyright-notice';

describe('buildCopyrightNotice', () => {
  it('names the owner and the year', () => {
    expect(buildCopyrightNotice('Edgar Ferreira', 2026)).toBe(
      '© 2026 Edgar Ferreira. All rights reserved.',
    );
  });
});
