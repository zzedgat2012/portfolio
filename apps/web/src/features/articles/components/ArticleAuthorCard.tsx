import Image from 'next/image';
import Link from 'next/link';
import type { Profile } from '@/features/profile';

type ArticleAuthorCardProps = {
  author: Pick<Profile, 'name' | 'heroTagline' | 'portrait'>;
  /** Where "Read more articles" leads. */
  articlesHref: string;
};

const HEADING_ID = 'article-author-heading';

/** "Written by <name>" card at the end of an article (Artigo mockups). */
export function ArticleAuthorCard({ author, articlesHref }: ArticleAuthorCardProps) {
  return (
    <section
      aria-labelledby={HEADING_ID}
      className="flex flex-col gap-6 rounded-2xl border border-border/30 bg-card/60 p-8 sm:flex-row sm:items-start"
    >
      <Image
        src={author.portrait.src}
        alt=""
        width={64}
        height={64}
        className="size-16 shrink-0 rounded-full bg-background object-cover"
      />
      <div className="space-y-3">
        <h2 id={HEADING_ID} className="font-mono text-lg font-bold text-foreground">
          Written by {author.name}
        </h2>
        <p className="text-sm text-foreground">{author.heroTagline}</p>
        <Link
          href={articlesHref}
          className="inline-flex h-10 items-center rounded-md border border-border bg-background px-4 font-mono text-sm font-bold text-foreground transition-colors duration-150 hover:bg-foreground hover:text-background"
        >
          Read more articles
        </Link>
      </div>
    </section>
  );
}
