/** Share targets of an article page ("Share this article", Artigo mockups). */
export type ArticleShareLinks = { twitter: string; linkedIn: string };

const TWITTER_INTENT_URL = 'https://x.com/intent/tweet';
const LINKEDIN_SHARE_URL = 'https://www.linkedin.com/sharing/share-offsite/';

/** Twitter/X and LinkedIn share URLs for the article's canonical `url`. */
export function buildArticleShareLinks({
  url,
  title,
}: {
  url: string;
  title: string;
}): ArticleShareLinks {
  return {
    twitter: `${TWITTER_INTENT_URL}?${new URLSearchParams({ url, text: title })}`,
    linkedIn: `${LINKEDIN_SHARE_URL}?${new URLSearchParams({ url })}`,
  };
}
