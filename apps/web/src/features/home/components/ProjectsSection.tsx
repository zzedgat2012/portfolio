import Image from 'next/image';
import { buildProjectPath, type Project } from '@/features/projects';
import { ArrowPillLink, Container, SectionEyebrow, TagList } from '@/shared/ui';
import { toProjectCountLabel } from '../model';

type ProjectsSectionProps = {
  /** Every project, in `sortOrder`. */
  projects: Project[];
  /** GitHub profile link, if the profile has one. */
  githubUrl: string | null;
};

const HEADING_ID = 'projects-heading';
// The four positional badges of the project list (DESIGN.md › Overview: the only UI emoji).
const POSITION_BADGES = ['🎨', '⚡', '🚀', '💡'] as const;

/** `#projects`: every project with title, tags, summary, cover and "Read more". */
export function ProjectsSection({ projects, githubUrl }: ProjectsSectionProps) {
  return (
    <section id="projects" aria-labelledby={HEADING_ID} className="scroll-mt-20 py-20">
      <Container>
        <SectionEyebrow id={HEADING_ID}>Projects</SectionEyebrow>
        <div className="mt-16 space-y-24">
          {projects.map((project, index) => (
            <article key={project.slug} className="grid gap-12 md:grid-cols-2 md:items-start">
              <div className="space-y-6">
                <h3 className="border-b border-border/30 pb-2 font-mono text-3xl leading-10 text-foreground md:text-4xl">
                  {project.title}
                </h3>
                <TagList tags={project.tags.map((tag) => tag.name)} />
                <p className="text-muted-foreground">{project.summary}</p>
                <ArrowPillLink
                  href={buildProjectPath(project.slug)}
                  srSuffix={`about ${project.title}`}
                >
                  Read more
                </ArrowPillLink>
              </div>
              <div className="relative">
                <div className="relative aspect-video overflow-hidden rounded-2xl border border-border/30 bg-card/30">
                  <Image
                    src={project.coverImage.src}
                    alt={project.coverImage.alt}
                    fill={true}
                    sizes="(min-width: 768px) 32rem, 100vw"
                    className="object-cover"
                  />
                </div>
                <span
                  aria-hidden="true"
                  className="absolute -bottom-6 -left-4 grid size-12 place-items-center rounded-lg border border-border/30 bg-card text-xl"
                >
                  {POSITION_BADGES[index % POSITION_BADGES.length]}
                </span>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-24 flex items-center justify-between gap-4 border-t border-border/30 pt-6 text-sm text-muted-foreground">
          {githubUrl ? (
            <a href={githubUrl} className="transition-colors duration-150 hover:text-foreground">
              View all projects on{' '}
              <span className="font-mono font-bold text-foreground">GitHub</span>
              <span aria-hidden="true"> →</span>
            </a>
          ) : (
            <span />
          )}
          <p className="font-mono text-xs tracking-meta uppercase">
            {toProjectCountLabel(projects.length)}
          </p>
        </div>
      </Container>
    </section>
  );
}
