import { buildAbsoluteUrl } from '@/shared/lib';
import { HOME_PATH } from './seo-paths';

export type RssItemInput = {
  title: string;
  /** Route of the article (`buildArticlePath`). */
  path: string;
  summary: string;
  /** `YYYY-MM-DD`. */
  publishedOn: string;
};

export type RssFeedInput = {
  title: string;
  description: string;
  siteUrl: string;
  /** Route of the feed itself, for `atom:link rel="self"`. */
  feedPath: string;
  items: readonly RssItemInput[];
};

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => XML_ESCAPES[character] ?? character);
}

/** RFC 822 date of a calendar day, at midnight UTC (`Fri, 19 Dec 2025 00:00:00 GMT`). */
export function toRfc822Date(calendarDate: string): string {
  return new Date(`${calendarDate}T00:00:00Z`).toUTCString();
}

function element(name: string, value: string): string {
  return `<${name}>${escapeXml(value)}</${name}>`;
}

/** RSS 2.0 document of the articles (story 3.1 AC4). */
export function buildRssFeed(input: RssFeedInput): string {
  const { title, description, siteUrl, feedPath, items } = input;
  const newest = items
    .map((item) => item.publishedOn)
    .sort()
    .at(-1);
  const itemLines = items.flatMap((item) => {
    const url = buildAbsoluteUrl(siteUrl, item.path);
    return [
      '<item>',
      element('title', item.title),
      element('link', url),
      `<guid isPermaLink="true">${escapeXml(url)}</guid>`,
      element('pubDate', toRfc822Date(item.publishedOn)),
      element('description', item.summary),
      '</item>',
    ];
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '<channel>',
    element('title', title),
    element('link', buildAbsoluteUrl(siteUrl, HOME_PATH)),
    element('description', description),
    element('language', 'en'),
    `<atom:link href="${escapeXml(buildAbsoluteUrl(siteUrl, feedPath))}" rel="self" type="application/rss+xml"/>`,
    ...(newest === undefined ? [] : [element('lastBuildDate', toRfc822Date(newest))]),
    ...itemLines,
    '</channel>',
    '</rss>',
    '',
  ].join('\n');
}
