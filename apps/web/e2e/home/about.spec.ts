import { expect, test } from '../fixtures';

test.describe('[story 2.2] About section', () => {
  test('is the #about section with the portrait and the bio rendered from Markdown @smoke', async ({
    homePage,
  }) => {
    await homePage.open();

    await expect(homePage.about).toHaveAttribute('id', 'about');
    await expect(
      homePage.about.getByRole('img', { name: 'Portrait of Edgar Ferreira' }),
    ).toBeVisible();
    await expect(homePage.about.getByText('5 years', { exact: true })).toBeVisible();
    await expect(homePage.about).toContainText("Hello! I'm Edgar Ferreira, a product engineer");
    await expect(homePage.about).not.toContainText('**');
  });

  test('shows technologies and tools as chips', async ({ homePage }) => {
    await homePage.open();

    const chips = homePage.about.getByRole('list', { name: 'Technologies & Tools' });
    await expect(chips.getByRole('listitem')).toHaveText([
      'Oracle APEX (Apps, Reports, Forms)',
      'API Design (REST)',
      'Design Systems',
    ]);
  });

  test('lists what Edgar does, his education and his certifications', async ({ homePage }) => {
    await homePage.open();

    await expect(
      homePage.about.getByRole('list', { name: 'What I Do' }).getByRole('listitem'),
    ).toHaveText([
      'Lead discovery and UX research to align problems with measurable outcomes',
      'Prototype and ship full-stack features',
    ]);
    await expect(
      homePage.about.getByRole('list', { name: 'Education' }).getByRole('listitem'),
    ).toHaveText(['Systems Analysis and Development', 'Product Design (Design Circuit)']);
    await expect(
      homePage.about.getByRole('list', { name: 'Certifications' }).getByRole('listitem'),
    ).toHaveText([
      '2021 · Oracle Cloud Foundations (Oracle)',
      '2021 · Oracle APEX Developer (Oracle)',
    ]);
  });
});
