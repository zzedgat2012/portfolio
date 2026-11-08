import { CopyButton } from '@/shared/ui';
import { buildArticleShareLinks } from '../model';

type ArticleShareProps = {
  /** Canonical absolute URL of the article. */
  url: string;
  title: string;
};

const HEADING_ID = 'article-share-heading';
const PILL_CLASS =
  'inline-flex h-10 items-center rounded-full bg-secondary px-4 font-mono text-sm text-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground';

/** "Share this article": Twitter/X and LinkedIn share links plus "Copy Link" (Artigo mockups). */
export function ArticleShare({ url, title }: ArticleShareProps) {
  const links = buildArticleShareLinks({ url, title });

  return (
    <section aria-labelledby={HEADING_ID} className="space-y-4 border-t border-border/30 py-8">
      <h2 id={HEADING_ID} className="text-sm text-muted-foreground">
        Share this article
      </h2>
      <div className="flex flex-wrap gap-3">
        <a href={links.twitter} target="_blank" rel="noopener noreferrer" className={PILL_CLASS}>
          Twitter
        </a>
        <a href={links.linkedIn} target="_blank" rel="noopener noreferrer" className={PILL_CLASS}>
          LinkedIn
        </a>
        <CopyButton text={url} className={PILL_CLASS}>
          Copy Link
        </CopyButton>
      </div>
    </section>
  );
}
