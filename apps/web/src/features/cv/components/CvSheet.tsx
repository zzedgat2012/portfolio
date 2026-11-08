import type { ReactNode } from 'react';
import { Markdown } from '@/shared/ui';
import type { Cv } from '../model';

type CvSheetProps = { cv: Cv };

type CvSectionProps = { id: string; title: string; children: ReactNode };

function CvSection({ id, title, children }: CvSectionProps) {
  const headingId = `cv-${id}-heading`;
  return (
    <section aria-labelledby={headingId} className="mt-8">
      <h2
        id={headingId}
        className="mb-4 break-after-avoid font-mono text-xl tracking-widest text-foreground uppercase"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function CvBulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm text-muted-foreground">
      {items.map((item) => (
        <li
          key={item}
          className="relative pl-3 before:absolute before:left-0 before:text-[0.6em] before:leading-[2.2] before:content-['▸']"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/** The printable CV (`CV (PDF, A4)` mockup): one A4 column, rendered to the PDF at build time. */
export function CvSheet({ cv }: CvSheetProps) {
  return (
    <article className="mx-auto w-full max-w-[210mm] px-[15mm] py-[15mm] print:max-w-none print:p-0">
      <header className="border-b border-border/40 pb-4">
        <h1 className="font-mono text-3xl font-bold text-foreground">{cv.name}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{cv.role}</p>
        <p className="mt-1 text-sm text-muted-foreground">{cv.contactLine}</p>
      </header>

      <CvSection id="summary" title="Summary">
        <Markdown className="text-sm leading-relaxed [&_p]:mb-3">{cv.summary}</Markdown>
      </CvSection>

      <CvSection id="skills" title="Skills">
        <p className="text-sm leading-relaxed text-muted-foreground">{cv.skills}</p>
      </CvSection>

      <CvSection id="experience" title="Experience">
        <ul className="space-y-4">
          {cv.experience.map((row) => (
            <li key={`${row.company}-${row.dateRange}`} className="break-inside-avoid">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-lg font-bold text-foreground">{row.company}</p>
                <p className="shrink-0 font-mono text-sm text-muted-foreground">{row.dateRange}</p>
              </div>
              <p className="text-foreground">{row.role}</p>
            </li>
          ))}
        </ul>
      </CvSection>

      <CvSection id="education" title="Education">
        <CvBulletList items={cv.education} />
      </CvSection>

      <CvSection id="certifications" title="Certifications">
        <CvBulletList items={cv.certifications} />
      </CvSection>

      <footer className="mt-6 break-inside-avoid border-t border-border/40 pt-2 text-center text-xs text-muted-foreground">
        {cv.footer}
      </footer>
    </article>
  );
}
