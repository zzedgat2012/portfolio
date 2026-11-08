import Image from 'next/image';
import type { Profile } from '@/features/profile';
import { Container, Markdown, SectionEyebrow } from '@/shared/ui';

type AboutSectionProps = {
  profile: Pick<
    Profile,
    'portrait' | 'bio' | 'technologies' | 'whatIDo' | 'education' | 'certifications'
  >;
};

const HEADING_ID = 'about-heading';
const SUBHEADING_CLASS = 'font-mono text-sm text-foreground';
const BULLET_CLASS =
  "relative pl-5 text-sm text-muted-foreground before:absolute before:left-0 before:text-accent before:content-['▸']";

/** `#about`: portrait, bio (Markdown), technology chips, What I Do, Education, Certifications. */
export function AboutSection({ profile }: AboutSectionProps) {
  const certifications = profile.certifications.map(({ year, title }) => `${year} · ${title}`);

  return (
    <section id="about" aria-labelledby={HEADING_ID} className="scroll-mt-20 py-20">
      <Container>
        <SectionEyebrow id={HEADING_ID}>About</SectionEyebrow>
        <div className="mt-16 grid gap-12 border-t border-border/30 pt-12 md:grid-cols-2">
          <div className="relative aspect-4/5 w-full self-center overflow-hidden rounded-3xl bg-card shadow-glow">
            <Image
              src={profile.portrait.src}
              alt={profile.portrait.alt}
              fill={true}
              sizes="(min-width: 768px) 32rem, 100vw"
              className="object-cover grayscale"
            />
          </div>
          <div className="space-y-10">
            <Markdown className="text-lg leading-relaxed">{profile.bio}</Markdown>

            <div className="space-y-4">
              <h3 id="about-technologies" className={SUBHEADING_CLASS}>
                Technologies &amp; Tools
              </h3>
              <ul aria-labelledby="about-technologies" className="flex flex-wrap gap-2">
                {profile.technologies.map((technology) => (
                  <li
                    key={technology}
                    className="rounded-lg bg-secondary px-3 py-1.5 font-mono text-xs text-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground"
                  >
                    {technology}
                  </li>
                ))}
              </ul>
            </div>

            <BulletList id="about-what-i-do" title="What I Do" items={profile.whatIDo} />
            <BulletList id="about-education" title="Education" items={profile.education} />
            <BulletList id="about-certifications" title="Certifications" items={certifications} />
          </div>
        </div>
      </Container>
    </section>
  );
}

type BulletListProps = { id: string; title: string; items: string[] };

function BulletList({ id, title, items }: BulletListProps) {
  return (
    <div className="space-y-4">
      <h3 id={id} className={SUBHEADING_CLASS}>
        {title}
      </h3>
      <ul aria-labelledby={id} className="space-y-2">
        {items.map((item) => (
          <li key={item} className={BULLET_CLASS}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
