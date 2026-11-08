import { expect, test } from '../fixtures';

test.describe('[story 2.2] Contact section', () => {
  test('shows name, role and location @smoke', async ({ homePage }) => {
    await homePage.open();

    await expect(homePage.contact).toHaveAttribute('id', 'contact');
    await expect(homePage.contact.getByText('Edgar Ferreira', { exact: true })).toBeVisible();
    await expect(
      homePage.contact.getByText('Product Engineer · Aracaju, Sergipe, Brazil'),
    ).toBeVisible();
  });

  test('shows phone, email, website and languages', async ({ homePage }) => {
    await homePage.open();

    await expect(homePage.contact.getByText('(79) 90000-0000')).toBeVisible();
    await expect(
      homePage.contact.getByRole('link', { name: 'seed@example.com', exact: true }),
    ).toHaveAttribute('href', 'mailto:seed@example.com');
    await expect(
      homePage.contact.getByRole('link', { name: 'edgar-ferreira.com', exact: true }),
    ).toHaveAttribute('href', 'https://edgar-ferreira.com');
    await expect(
      homePage.contact.getByText('Portuguese (Native) · English (Professional)'),
    ).toBeVisible();
  });

  test('lists only the profile links shown in Contact', async ({ homePage }) => {
    await homePage.open();

    const links = homePage.contact.getByRole('list', { name: 'Contact links' }).getByRole('link');
    await expect(links).toHaveText(['Portfolio', 'LinkedIn', 'GitHub', 'Email (Personal)']);
    await expect(links.nth(2)).toHaveAttribute('href', 'https://github.com/seed');
  });
});
