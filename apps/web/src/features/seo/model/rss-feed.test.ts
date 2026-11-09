import { describe, expect, test } from 'vitest';
import { buildRssFeed, escapeXml, toRfc822Date } from './rss-feed';

describe('[story 3.1] escapeXml', () => {
  test('escapes the five XML special characters', () => {
    expect(escapeXml(`Tom & Jerry's <"tag">`)).toBe(
      'Tom &amp; Jerry&apos;s &lt;&quot;tag&quot;&gt;',
    );
  });
});

describe('[story 3.1] toRfc822Date', () => {
  test('turns a YYYY-MM-DD date into an RFC 822 date at midnight UTC', () => {
    expect(toRfc822Date('2025-12-19')).toBe('Fri, 19 Dec 2025 00:00:00 GMT');
  });
});

describe('[story 3.1] buildRssFeed', () => {
  const channel = {
    title: 'Edgar Ferreira',
    description: 'Product engineer & designer',
    siteUrl: 'https://edgar-ferreira.com',
    feedPath: '/feed.xml',
  };

  test('renders an RSS 2.0 channel with one item per article', () => {
    const xml = buildRssFeed({
      ...channel,
      items: [
        {
          title: 'Kafka + Go <fast>',
          path: '/article/kafka-golang-setup/',
          summary: 'The "simplest" example.',
          publishedOn: '2025-12-19',
        },
      ],
    });

    expect(xml).toBe(
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
        '<channel>',
        '<title>Edgar Ferreira</title>',
        '<link>https://edgar-ferreira.com/</link>',
        '<description>Product engineer &amp; designer</description>',
        '<language>en</language>',
        '<atom:link href="https://edgar-ferreira.com/feed.xml" rel="self" type="application/rss+xml"/>',
        '<lastBuildDate>Fri, 19 Dec 2025 00:00:00 GMT</lastBuildDate>',
        '<item>',
        '<title>Kafka + Go &lt;fast&gt;</title>',
        '<link>https://edgar-ferreira.com/article/kafka-golang-setup/</link>',
        '<guid isPermaLink="true">https://edgar-ferreira.com/article/kafka-golang-setup/</guid>',
        '<pubDate>Fri, 19 Dec 2025 00:00:00 GMT</pubDate>',
        '<description>The &quot;simplest&quot; example.</description>',
        '</item>',
        '</channel>',
        '</rss>',
        '',
      ].join('\n'),
    );
  });

  test('omits lastBuildDate when there is no article', () => {
    const xml = buildRssFeed({ ...channel, items: [] });

    expect(xml).not.toContain('<lastBuildDate>');
    expect(xml).not.toContain('<item>');
  });

  test('uses the newest article date as lastBuildDate, whatever the item order', () => {
    const xml = buildRssFeed({
      ...channel,
      items: [
        { title: 'Old', path: '/article/old/', summary: 'o', publishedOn: '2024-03-01' },
        { title: 'New', path: '/article/new/', summary: 'n', publishedOn: '2025-12-19' },
      ],
    });

    expect(xml).toContain('<lastBuildDate>Fri, 19 Dec 2025 00:00:00 GMT</lastBuildDate>');
  });
});
