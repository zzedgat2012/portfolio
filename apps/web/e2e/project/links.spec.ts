import { expect, test } from '../fixtures';

test.describe('[story 2.3] Project demo and code links', () => {
  test('shows View Demo and View Code as safe external links when both URLs exist @smoke', async ({
    projectPage,
  }) => {
    await projectPage.openProject('seed-featured-project');

    await expect(projectPage.demoLink).toHaveAttribute(
      'href',
      'https://demo.example.com/seed-featured-project',
    );
    await expect(projectPage.codeLink).toHaveAttribute(
      'href',
      'https://github.com/example/seed-featured-project',
    );
    for (const link of [projectPage.demoLink, projectPage.codeLink]) {
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  test('shows only View Code when the project has only a code URL', async ({ projectPage }) => {
    await projectPage.openProject('seed-second-featured-project');

    await expect(projectPage.codeLink).toHaveAttribute(
      'href',
      'https://github.com/example/seed-second-featured-project',
    );
    await expect(projectPage.demoLink).toHaveCount(0);
  });

  test('shows neither button when the project has no links', async ({ projectPage }) => {
    await projectPage.openProject('seed-project-without-links');

    await expect(projectPage.heading).toBeVisible();
    await expect(projectPage.demoLink).toHaveCount(0);
    await expect(projectPage.codeLink).toHaveCount(0);
  });
});
