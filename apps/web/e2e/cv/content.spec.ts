import { expect, test } from '../fixtures';

test.describe('[story 2.5] CV page content', () => {
  test('shows the name, role and the location • phone • website line @smoke', async ({
    cvPage,
  }) => {
    await cvPage.open();

    await expect(cvPage.heading).toHaveText('Edgar Ferreira');
    await expect(cvPage.main.getByText('Product Engineer', { exact: true })).toBeVisible();
    await expect(
      cvPage.main.getByText('Aracaju, Sergipe, Brazil • (79) 90000-0000 • edgar-ferreira.com'),
    ).toBeVisible();
  });

  test('shows the bio as the Summary and the technologies as Skills', async ({ cvPage }) => {
    await cvPage.open();

    const summary = cvPage.section('Summary');
    await expect(summary).toContainText("Hello! I'm Edgar Ferreira, a product engineer");
    await expect(summary).toContainText('With over 5 years, I work from discovery through launch.');
    await expect(cvPage.section('Skills')).toHaveText(
      /Oracle APEX \(Apps, Reports, Forms\) • API Design \(REST\) • Design Systems/,
    );
  });

  test('lists every position with company, role and date range @smoke', async ({ cvPage }) => {
    await cvPage.open();

    const rows = cvPage.section('Experience').getByRole('listitem');
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(0)).toContainText('Seed Current Company');
    await expect(rows.nth(0)).toContainText('Oracle APEX Developer');
    await expect(rows.nth(0)).toContainText('Mar 2025 – Present');
    await expect(rows.nth(1)).toContainText('Seed Past Company');
    await expect(rows.nth(1)).toContainText('PHP Developer');
    await expect(rows.nth(1)).toContainText('Sep 2023 – Nov 2023');
    await expect(rows.nth(2)).toContainText('Jul 2018 – Apr 2021');
  });

  test('lists education and certifications with their year', async ({ cvPage }) => {
    await cvPage.open();

    const education = cvPage.section('Education').getByRole('listitem');
    await expect(education).toHaveText([
      'Systems Analysis and Development',
      'Product Design (Design Circuit)',
    ]);
    const certifications = cvPage.section('Certifications').getByRole('listitem');
    await expect(certifications).toHaveText([
      '2021 · Oracle Cloud Foundations (Oracle)',
      '2021 · Oracle APEX Developer (Oracle)',
    ]);
  });

  test('ends with the "Generated from the site" footer line', async ({ cvPage }) => {
    await cvPage.open();

    await expect(
      cvPage.main.getByText('edgar-ferreira.com • Generated from the site'),
    ).toBeVisible();
  });
});
