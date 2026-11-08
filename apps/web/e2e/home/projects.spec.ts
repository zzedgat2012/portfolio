import { expect, test } from '../fixtures';

test.describe('[story 2.2] Projects section', () => {
  test('lists every project in sortOrder @smoke', async ({ homePage }) => {
    await homePage.open();

    await expect(homePage.projects).toHaveAttribute('id', 'projects');
    await expect(homePage.projects.getByRole('heading', { level: 3 })).toHaveText([
      'Seed project without links',
      'Seed featured project',
      'Seed second featured project',
    ]);
  });

  test('shows tags, summary, cover and a "Read more" link on each card', async ({ homePage }) => {
    await homePage.open();

    const card = homePage.projectCard('Seed featured project');
    await expect(card.getByRole('list', { name: 'Tags' }).getByRole('listitem')).toHaveText([
      'Golang',
      'Kafka',
    ]);
    await expect(
      card.getByText('A featured fixture project with demo and code links.'),
    ).toBeVisible();
    await expect(
      card.getByRole('img', { name: 'Diagram of the seed featured project' }),
    ).toBeVisible();
    await expect(
      card.getByRole('link', { name: 'Read more about Seed featured project' }),
    ).toHaveAttribute('href', '/project/seed-featured-project/');
  });

  test('links to GitHub and shows the project count', async ({ homePage }) => {
    await homePage.open();

    await expect(
      homePage.projects.getByRole('link', { name: 'View all projects on GitHub' }),
    ).toHaveAttribute('href', 'https://github.com/seed');
    await expect(homePage.projects.getByText('3 projects')).toBeVisible();
  });
});
