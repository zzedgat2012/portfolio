import { expect, test } from '../fixtures';

// Regression: Decap mounts itself into <body> on load; a script placed in <head> crashed it
// ("Cannot read properties of null (reading 'appendChild')") and left a blank screen.
test.describe('[story 0] Content admin', () => {
  test('boots Decap and offers a login without script errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto('/admin/');

    await expect(page.getByRole('button', { name: /login/i })).toBeVisible({ timeout: 15_000 });
    expect(errors).toEqual([]);
  });
});
