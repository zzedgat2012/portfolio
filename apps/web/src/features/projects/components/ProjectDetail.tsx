import { Code, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { BackLink, Container, ExternalLinkButton, Markdown, TagList } from '@/shared/ui';
import type { Project } from '../model';

type ProjectDetailProps = { project: Project };

/** Home anchor of the project list (architecture D1: no project index page). */
const PROJECTS_ANCHOR = '/#projects';
const SECTION_HEADING_CLASS = 'font-mono text-2xl font-normal text-foreground md:text-3xl';
const OVERVIEW_ID = 'project-overview';
const FEATURES_ID = 'project-features';
const TECHNOLOGIES_ID = 'project-technologies';

/** Project page body (Projeto mockups): header, links, 16:9 cover, overview, features, technologies. */
export function ProjectDetail({ project }: ProjectDetailProps) {
  const hasLinks = project.demoUrl !== null || project.codeUrl !== null;

  return (
    <article className="py-16 md:py-20">
      <Container>
        <div className="mx-auto max-w-208">
          <BackLink href={PROJECTS_ANCHOR}>Back to projects</BackLink>

          <header className="mt-10 space-y-6">
            <h1 className="font-mono text-4xl leading-tight font-bold tracking-tight text-foreground md:text-6xl">
              {project.title}
            </h1>
            <TagList tags={project.tags.map((tag) => tag.name)} />
            {hasLinks ? (
              <div className="flex flex-wrap gap-4">
                {project.demoUrl !== null ? (
                  <ExternalLinkButton
                    href={project.demoUrl}
                    variant="primary"
                    icon={<ExternalLink size={16} />}
                  >
                    View Demo
                  </ExternalLinkButton>
                ) : null}
                {project.codeUrl !== null ? (
                  <ExternalLinkButton
                    href={project.codeUrl}
                    variant="outline"
                    icon={<Code size={16} />}
                  >
                    View Code
                  </ExternalLinkButton>
                ) : null}
              </div>
            ) : null}
          </header>

          <div className="relative mt-12 aspect-video overflow-hidden rounded-2xl bg-card shadow-glow">
            <Image
              src={project.coverImage.src}
              alt={project.coverImage.alt}
              fill={true}
              priority={true}
              sizes="(min-width: 960px) 52rem, 100vw"
              className="object-cover"
            />
          </div>

          <section aria-labelledby={OVERVIEW_ID} className="mt-12 space-y-6">
            <h2 id={OVERVIEW_ID} className={SECTION_HEADING_CLASS}>
              Overview
            </h2>
            <Markdown className="leading-relaxed">{project.overview}</Markdown>
          </section>

          {project.features.length > 0 ? (
            <section aria-labelledby={FEATURES_ID} className="mt-16 space-y-6">
              <h2 id={FEATURES_ID} className={SECTION_HEADING_CLASS}>
                Key Features
              </h2>
              <ul aria-labelledby={FEATURES_ID} className="grid gap-4 md:grid-cols-2">
                {project.features.map((feature) => (
                  <li
                    key={feature}
                    className="rounded-lg border border-transparent bg-card px-4 py-4 text-sm text-card-foreground transition-colors duration-150 hover:border-accent"
                  >
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {project.technologies.length > 0 ? (
            <section aria-labelledby={TECHNOLOGIES_ID} className="mt-16 space-y-6">
              <h2 id={TECHNOLOGIES_ID} className={SECTION_HEADING_CLASS}>
                Technologies Used
              </h2>
              <ul aria-labelledby={TECHNOLOGIES_ID} className="flex flex-wrap gap-3">
                {project.technologies.map((technology) => (
                  <li
                    key={technology}
                    className="rounded-lg bg-secondary px-4 py-2 font-mono text-sm text-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground"
                  >
                    {technology}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </Container>
    </article>
  );
}
