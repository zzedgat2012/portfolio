import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { type Article, buildArticlePath } from '@/features/articles';
import { Container, SectionDisplayHeading } from '@/shared/ui';

type ArticlesSectionProps = {
  /** Every article, newest first. */
  articles: Article[];
};

const HEADING_ID = 'articles-heading';

/** `#articles`: one card per article with title, summary and "Read more". */
export function ArticlesSection({ articles }: ArticlesSectionProps) {
  return (
    <section id="articles" aria-labelledby={HEADING_ID} className="scroll-mt-20 py-20">
      <Container>
        <div className="flex items-end gap-6">
          <div aria-hidden="true" className="mb-2 h-px flex-1 bg-border" />
          <SectionDisplayHeading id={HEADING_ID}>Articles</SectionDisplayHeading>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {articles.map((article) => (
            <article
              key={article.slug}
              className="flex flex-col gap-4 rounded-2xl bg-card p-8 text-card-foreground transition-shadow duration-150 hover:shadow-glow"
            >
              <h3 className="font-mono text-lg leading-7">{article.title}</h3>
              <p className="text-sm text-muted-foreground">{article.summary}</p>
              <Link
                href={buildArticlePath(article.slug)}
                className="inline-flex w-fit items-center gap-2 rounded-full bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-foreground hover:text-background"
              >
                Read more<span className="sr-only"> about {article.title}</span>
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
