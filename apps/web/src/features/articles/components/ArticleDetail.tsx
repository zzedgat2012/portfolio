import { Calendar, Clock } from 'lucide-react';
import Image from 'next/image';
import type { Profile } from '@/features/profile';
import { toLongDateLabel } from '@/shared/lib';
import { BackLink, Container, HighlightedMarkdown, TagList } from '@/shared/ui';
import { type Article, toReadingTimeLabel } from '../model';
import { ArticleAuthorCard } from './ArticleAuthorCard';
import { ArticleShare } from './ArticleShare';

type ArticleDetailProps = {
  article: Article;
  author: Pick<Profile, 'name' | 'role' | 'heroTagline' | 'portrait'>;
  /** Canonical absolute URL of the article, used by the share links. */
  canonicalUrl: string;
};

/** Home anchor of the article list (architecture D1: no article index page). */
const ARTICLES_ANCHOR = '/#articles';

/**
 * Article page body (Artigo mockups): back link, tags, title, date and reading time, author,
 * highlighted Markdown body, share links and the author card. The mockups show no cover image,
 * so `coverImage` is not rendered here.
 */
export function ArticleDetail({ article, author, canonicalUrl }: ArticleDetailProps) {
  return (
    <article className="py-16 md:py-20">
      <Container>
        <div className="mx-auto max-w-208">
          <BackLink href={ARTICLES_ANCHOR}>Back to articles</BackLink>

          <header className="mt-10 space-y-8 border-b border-border/30 pb-10">
            <TagList tags={article.tags.map((tag) => tag.name)} />
            <h1 className="font-mono text-4xl leading-tight font-bold tracking-tight text-foreground md:text-6xl">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Calendar size={16} aria-hidden="true" />
                <time dateTime={article.publishedOn}>{toLongDateLabel(article.publishedOn)}</time>
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock size={16} aria-hidden="true" />
                <span>{toReadingTimeLabel(article.readingTimeMinutes)}</span>
              </span>
            </div>
            <section aria-label="Author" className="flex items-center gap-4">
              <Image
                src={author.portrait.src}
                alt={author.portrait.alt}
                width={48}
                height={48}
                className="size-12 rounded-full bg-card object-cover"
              />
              <div>
                <p className="font-mono text-sm font-bold text-foreground">{author.name}</p>
                <p className="text-sm text-muted-foreground">{author.role}</p>
              </div>
            </section>
          </header>

          <section aria-label="Article body" className="py-12">
            <HighlightedMarkdown className="text-lg leading-relaxed">
              {article.body}
            </HighlightedMarkdown>
          </section>

          <ArticleShare url={canonicalUrl} title={article.title} />

          <div className="border-t border-border/30 pt-8">
            <ArticleAuthorCard author={author} articlesHref={ARTICLES_ANCHOR} />
          </div>
        </div>
      </Container>
    </article>
  );
}
