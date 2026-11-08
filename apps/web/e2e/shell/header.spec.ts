import { expect, test } from '../fixtures';

const SECTIONS = [
  { name: 'About', href: '/#about' },
  { name: 'Projects', href: '/#projects' },
  { name: 'Articles', href: '/#articles' },
  { name: 'Contact', href: '/#contact' },
] as const;

test.describe('[story 2.1] Site header', () => {
  test('links the site name to the home page @smoke', async ({ siteShell }) => {
    await siteShell.open();

    await expect(siteShell.homeLink).toBeVisible();
    await expect(siteShell.homeLink).toHaveAttribute('href', '/');
  });

  test('links About, Projects, Articles and Contact to the home sections @smoke', async ({
    siteShell,
  }) => {
    await siteShell.open();

    for (const section of SECTIONS) {
      await expect(siteShell.navLink(section.name)).toBeVisible();
      await expect(siteShell.navLink(section.name)).toHaveAttribute('href', section.href);
    }
  });

  test('marks the section named in the URL as current', async ({ siteShell }) => {
    await siteShell.open('/#contact');

    await expect(siteShell.navLink('Contact')).toHaveAttribute('aria-current', 'location');
    await expect(siteShell.navLink('About')).not.toHaveAttribute('aria-current');
  });

  test('marks the section as current after following its link', async ({ page, siteShell }) => {
    await siteShell.open();

    await siteShell.goToSection('Articles');

    await expect(page).toHaveURL(/\/#articles$/);
    await expect(siteShell.navLink('Articles')).toHaveAttribute('aria-current', 'location');
    await expect(siteShell.navLink('Contact')).not.toHaveAttribute('aria-current');
  });

  test('exposes banner, navigation, main and contentinfo landmarks @smoke', async ({
    siteShell,
  }) => {
    await siteShell.open();

    await expect(siteShell.banner).toBeVisible();
    await expect(siteShell.mainNavigation).toBeVisible();
    await expect(siteShell.main).toBeVisible();
    await expect(siteShell.footer).toBeVisible();
  });
});

test.describe('[story 2.1] Skip link', () => {
  test('is the first focusable element and moves focus to the main content @smoke', async ({
    page,
    siteShell,
  }) => {
    await siteShell.open();

    await page.keyboard.press('Tab');
    await expect(siteShell.skipLink).toBeFocused();
    await expect(siteShell.skipLink).toBeVisible();

    await page.keyboard.press('Enter');
    await expect(siteShell.main).toBeFocused();
  });
});

test.describe('[story 2.1] Site header on mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('hides the section links behind a menu button @smoke', async ({ siteShell }) => {
    await siteShell.open();

    await expect(siteShell.homeLink).toBeVisible();
    await expect(siteShell.menuButton).toBeVisible();
    await expect(siteShell.menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(siteShell.navLink('About')).toBeHidden();

    await siteShell.openMobileMenu();

    await expect(siteShell.menuButton).toHaveAttribute('aria-expanded', 'true');
    for (const section of SECTIONS) {
      await expect(siteShell.navLink(section.name)).toBeVisible();
    }
  });

  test('closes the menu after a section is chosen', async ({ page, siteShell }) => {
    await siteShell.open();
    await siteShell.openMobileMenu();

    await siteShell.goToSection('Projects');

    await expect(page).toHaveURL(/\/#projects$/);
    await expect(siteShell.menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(siteShell.navLink('Projects')).toBeHidden();
  });

  test('closes the menu with Escape', async ({ page, siteShell }) => {
    await siteShell.open();
    await siteShell.openMobileMenu();

    await page.keyboard.press('Escape');

    await expect(siteShell.menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(siteShell.menuButton).toBeFocused();
  });
});
