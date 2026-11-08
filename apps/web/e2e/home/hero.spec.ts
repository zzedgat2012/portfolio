import { expect, test } from '../fixtures';

test.describe('[story 2.2] Home hero', () => {
  test('shows the hero title and tagline from the profile @smoke', async ({ page, homePage }) => {
    await homePage.open();

    await expect(homePage.heading).toHaveAccessibleName('Product Engineer');
    await expect(homePage.heading).toBeVisible();
    await expect(
      page.getByText('Designs digital products end-to-end, combining strategy', { exact: false }),
    ).toBeVisible();
  });

  test('links "View Products" to the projects section @smoke', async ({ page, homePage }) => {
    await homePage.open();

    await expect(homePage.viewProductsLink).toHaveAttribute('href', '#projects');
    await homePage.viewProductsLink.click();

    await expect(page).toHaveURL(/#projects$/);
    await expect(homePage.projects).toBeInViewport();
  });

  test('lists only the profile links shown in the hero, each with a name', async ({ homePage }) => {
    await homePage.open();

    const links = homePage.heroLinks.getByRole('link');
    await expect(links).toHaveCount(3);
    await expect(homePage.heroLinks.getByRole('link', { name: 'Portfolio' })).toHaveAttribute(
      'href',
      'https://edgar-ferreira.com',
    );
    await expect(homePage.heroLinks.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/seed',
    );
    await expect(
      homePage.heroLinks.getByRole('link', { name: 'Email (Personal)' }),
    ).toHaveAttribute('href', 'mailto:seed@example.com');
    await expect(homePage.heroLinks.getByRole('link', { name: 'GitHub' })).toHaveCount(0);
  });
});

test.describe('[story 2.2] Home hero on mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('keeps an accessible name on the icon-only hero links', async ({ homePage }) => {
    await homePage.open();

    await expect(homePage.heroLinks.getByRole('link', { name: 'LinkedIn' })).toBeVisible();
    await expect(homePage.heading).toHaveAccessibleName('Product Engineer');
  });
});
