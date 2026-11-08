import { expect, test } from '../fixtures';

test.describe('[story 2.1] Site footer', () => {
  test('shows the copyright notice with the profile name @smoke', async ({ siteShell }) => {
    await siteShell.open();

    // The year is the build year; the e2e build runs right before the suite.
    const year = new Date().getFullYear();
    await expect(siteShell.footer).toHaveText(`© ${year} Edgar Ferreira. All rights reserved.`);
  });
});
