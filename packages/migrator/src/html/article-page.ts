import { load } from 'cheerio';

export type ArticlePageExtras = {
  /** The date shown on the page (`YYYY-MM-DD`), or `null` when it shows none. */
  publishedOn: string | null;
};

/** What the rendered `/article/<slug>/` page adds to the REST post. */
export function mapArticlePageToExtras(html: string): ArticlePageExtras {
  const page = load(html);
  const datetime = page('main time[datetime]').first().attr('datetime') ?? '';
  const match = /^\d{4}-\d{2}-\d{2}/.exec(datetime);
  return { publishedOn: match ? match[0] : null };
}
