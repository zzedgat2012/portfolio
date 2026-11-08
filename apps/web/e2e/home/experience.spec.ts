import { expect, test } from '../fixtures';

test.describe('[story 2.2] Experience section', () => {
  test('lists every position with its date range, company and role @smoke', async ({
    homePage,
  }) => {
    await homePage.open();

    await expect(homePage.experience).toHaveAttribute('id', 'experience');
    const rows = homePage.experience.getByRole('listitem');
    await expect(rows).toHaveCount(3);

    await expect(rows.nth(0)).toContainText('Mar 2025 – Present');
    await expect(rows.nth(0)).toContainText('Seed Current Company');
    await expect(rows.nth(0)).toContainText('Oracle APEX Developer');

    await expect(rows.nth(1)).toContainText('Sep 2023 – Nov 2023');
    await expect(rows.nth(1)).toContainText('Seed Past Company');
    await expect(rows.nth(1)).toContainText('PHP Developer');
  });

  test('shows "Current" for open ranges and the duration for closed ones', async ({ homePage }) => {
    await homePage.open();

    const rows = homePage.experience.getByRole('listitem');
    await expect(rows.nth(0)).toContainText('Current');
    await expect(rows.nth(1)).toContainText('3 months');
    await expect(rows.nth(2)).toContainText('Jul 2018 – Apr 2021');
    await expect(rows.nth(2)).toContainText('2 years 10 months');
    await expect(rows.nth(2)).not.toContainText('Current');
  });

  test('shows the professional summary and a "Download CV" link', async ({ homePage }) => {
    await homePage.open();

    await expect(
      homePage.experience.getByText('5+ years across product engineering, UX, and Oracle APEX'),
    ).toBeVisible();
    await expect(homePage.experience.getByRole('link', { name: 'Download CV' })).toHaveAttribute(
      'href',
      '/edgar-ferreira-cv.pdf',
    );
  });
});
