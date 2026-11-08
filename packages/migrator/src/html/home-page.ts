import { type LinkIcon, type ProfileFile, ValidationError } from '@portfolio/contracts';
import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import type { AnyNode, Element } from 'domhandler';
import { decodeCloudflareEmail } from './cloudflare-email';
import { toParenthetical, toPlainText } from './text';

/** The profile as the home page shows it; the portrait is still the WordPress URL. */
export type HomeProfile = Omit<ProfileFile, 'portrait' | 'portraitAlt'> & { portraitUrl: string };

type ProfileLink = ProfileFile['links'][number];
type Experience = ProfileFile['experience'][number];

const CLOUDFLARE_EMAIL_PATH = '/cdn-cgi/l/email-protection#';
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const ICONS_BY_LABEL: ReadonlyArray<readonly [RegExp, LinkIcon]> = [
  [/^e-?mail/i, 'email'],
  [/^linkedin/i, 'linkedin'],
  [/^github/i, 'github'],
  [/^portfolio/i, 'portfolio'],
  [/^whatsapp/i, 'whatsapp'],
  [/^facebook/i, 'facebook'],
  [/^instagram/i, 'instagram'],
  [/^(twitter|x)$/i, 'twitter'],
  [/^phone/i, 'phone'],
];

function fail(message: string): never {
  throw new ValidationError(`home page: ${message}`);
}

/** `/cdn-cgi/l/email-protection#<hex>` becomes `mailto:<email>`; other hrefs are kept. */
function toLinkUrl(href: string): string {
  return href.startsWith(CLOUDFLARE_EMAIL_PATH)
    ? `mailto:${decodeCloudflareEmail(href.slice(CLOUDFLARE_EMAIL_PATH.length))}`
    : href;
}

function toLinkIcon(label: string): LinkIcon {
  return ICONS_BY_LABEL.find(([pattern]) => pattern.test(label))?.[1] ?? 'website';
}

/** Links that carry a visible `<span>` label (hero pills, contact buttons). */
function listLabelledLinks(page: CheerioAPI, scope: Cheerio<Element>): Array<[string, string]> {
  return scope
    .find('a')
    .toArray()
    .flatMap((element): Array<[string, string]> => {
      const href = page(element).attr('href')?.trim() ?? '';
      const label = toPlainText(page(element).find('span').first().text());
      return href !== '' && !href.startsWith('#') && label !== '' ? [[label, toLinkUrl(href)]] : [];
    });
}

/**
 * One list for hero and contact links (the schema has one list with two flags). Links with the
 * same URL are merged; the relative order of both the hero and the contact links is preserved.
 */
function mergeLinks(
  hero: Array<[string, string]>,
  contact: Array<[string, string]>,
): ProfileLink[] {
  const toLink = (label: string, url: string, isHero: boolean, isContact: boolean) => ({
    label,
    url,
    icon: toLinkIcon(label),
    showInHero: isHero,
    showInContact: isContact,
  });
  const links: ProfileLink[] = [];
  let heroIndex = 0;
  for (const [label, url] of contact) {
    const shared = hero.findIndex(([, heroUrl], index) => index >= heroIndex && heroUrl === url);
    if (shared === -1) {
      links.push(toLink(label, url, false, true));
      continue;
    }
    for (const [heroLabel, heroUrl] of hero.slice(heroIndex, shared)) {
      links.push(toLink(heroLabel, heroUrl, true, false));
    }
    links.push(toLink(label, url, true, true));
    heroIndex = shared + 1;
  }
  for (const [heroLabel, heroUrl] of hero.slice(heroIndex)) {
    links.push(toLink(heroLabel, heroUrl, true, false));
  }
  return links;
}

/** Text of a paragraph with its highlighted `<span>`s in bold. */
function toMarkdownParagraph(page: CheerioAPI, paragraph: Element): string {
  const parts = page(paragraph)
    .contents()
    .toArray()
    .map((node: AnyNode) => {
      const text = page(node).text();
      return node.type === 'tag' && toPlainText(text) !== '' ? `**${toPlainText(text)}**` : text;
    });
  return toPlainText(parts.join(''));
}

/** The block under the `<h3>` titled `heading` inside `scope`. */
function findBlock(page: CheerioAPI, scope: Cheerio<Element>, heading: string): Cheerio<Element> {
  return scope
    .find('h3')
    .filter((_index, element) => toPlainText(page(element).text()) === heading)
    .first()
    .parent();
}

/** List items without their decorative `▸` marker. */
function listItems(page: CheerioAPI, block: Cheerio<Element>): string[] {
  return block
    .find('li')
    .toArray()
    .map((item) => {
      const clone = page(item).clone();
      clone.find('span').remove();
      return toPlainText(clone.text());
    });
}

/** `Mar 2025` → `2025-03`. */
function toYearMonth(text: string): string {
  const match = /^([A-Za-z]{3})[a-z]*\.? (\d{4})$/.exec(text.trim());
  const month = match ? MONTHS.indexOf((match[1] ?? '').toLowerCase()) : -1;
  if (!match || month === -1) {
    return fail(`cannot read the month "${text}"`);
  }
  return `${match[2]}-${String(month + 1).padStart(2, '0')}`;
}

function toExperience(range: string, company: string, roleLine: string): Experience {
  const [start, end] = range.split(/\s+[–-]\s+/);
  if (start === undefined || end === undefined) {
    return fail(`cannot read the date range "${range}"`);
  }
  const role = roleLine.split(' · ')[0] ?? roleLine;
  const isCurrent = /^present$/i.test(end.trim());
  return {
    company,
    role,
    startOn: toYearMonth(start),
    ...(isCurrent ? {} : { endOn: toYearMonth(end) }),
  };
}

function readExperience(page: CheerioAPI): Experience[] {
  return page('#work a')
    .toArray()
    .flatMap((row) => {
      const texts = page(row)
        .find('p')
        .toArray()
        .map((paragraph) => toPlainText(page(paragraph).text()));
      const [range, _duration, company, roleLine] = texts;
      return range && company && roleLine ? [toExperience(range, company, roleLine)] : [];
    });
}

function readExperienceSummary(page: CheerioAPI): string {
  const label = page('#work p')
    .filter((_index, element) => toPlainText(page(element).text()) === 'Professional experience')
    .first();
  return toPlainText(label.next('p').text());
}

/** `Label<br><span>value</span>` rows of the contact block, keyed by label. */
function readContactFields(page: CheerioAPI, contact: Cheerio<Element>): Map<string, string> {
  const fields = new Map<string, string>();
  contact.find('p').each((_index, paragraph) => {
    const value = page(paragraph).children('span').first();
    if (value.length === 0) {
      return;
    }
    const label = toPlainText(
      page(paragraph)
        .contents()
        .filter((_i, node) => node.type === 'text')
        .text(),
    );
    const protectedEmail = value.find('[data-cfemail]').attr('data-cfemail');
    fields.set(
      label,
      protectedEmail ? decodeCloudflareEmail(protectedEmail) : toPlainText(value.text()),
    );
  });
  return fields;
}

function readCertification(text: string): ProfileFile['certifications'][number] {
  const match = /^(\d{4})\s*·\s*(.+)$/.exec(text);
  if (!match) {
    return fail(`cannot read the certification "${text}"`);
  }
  return { year: Number(match[1]), title: toParenthetical(match[2] ?? '') };
}

/** Everything the theme rendered on `/` from its own templates (none of it is in the REST API). */
export function mapHomePageToProfile(html: string): HomeProfile {
  const page = load(html);
  const hero = page('main section').first();
  const about = page('#about');
  const contact = page('#contact');

  const heroWords = [
    ...new Set(
      hero
        .find('div.font-bold')
        .toArray()
        .map((element) => toPlainText(page(element).text())),
    ),
  ];
  const [role = '', location = ''] = toPlainText(contact.find('h3').first().next('p').text()).split(
    ' · ',
  );
  const fields = readContactFields(page, contact);

  return {
    name: toPlainText(
      contact
        .find('h3')
        .first()
        .find('span')
        .toArray()
        .map((span) => page(span).text())
        .join(' '),
    ),
    role,
    location,
    heroTitle: heroWords.join(' '),
    heroTagline: toPlainText(hero.find('p').first().text()),
    portraitUrl: about.find('img').first().attr('src') ?? '',
    bio: about
      .find('p')
      .toArray()
      .map((paragraph) => toMarkdownParagraph(page, paragraph))
      .join('\n\n'),
    technologies: findBlock(page, about, 'Technologies & Tools')
      .find('span')
      .toArray()
      .map((span) => toPlainText(page(span).text())),
    whatIDo: listItems(page, findBlock(page, about, 'What I Do')),
    education: listItems(page, findBlock(page, about, 'Education')).map(toParenthetical),
    certifications: listItems(page, findBlock(page, about, 'Certifications')).map(
      readCertification,
    ),
    experience: readExperience(page),
    experienceSummary: readExperienceSummary(page),
    contact: {
      phone: fields.get('Phone') ?? '',
      email: fields.get('Primary Email') ?? '',
      website: fields.get('Portfolio') ?? '',
      languages: fields.get('Languages') ?? '',
    },
    links: mergeLinks(listLabelledLinks(page, hero), listLabelledLinks(page, contact)),
  };
}

/** Slugs of the projects in the home page carousel, in carousel order. */
export function listFeaturedProjectSlugs(html: string): string[] {
  const page = load(html);
  const slugs = page('[data-carousel] a[href]')
    .toArray()
    .flatMap((link) => {
      const match = /\/project\/([^/]+)\/?$/.exec(page(link).attr('href') ?? '');
      return match?.[1] ? [match[1]] : [];
    });
  return [...new Set(slugs)];
}
