import { type CheerioAPI, load } from 'cheerio';
import { toPlainText } from './text';

export type ProjectPageExtras = {
  features: string[];
  technologies: string[];
  demoUrl?: string;
  codeUrl?: string;
};

function listSectionTexts(page: CheerioAPI, heading: string, itemSelector: string): string[] {
  const section = page('main h2')
    .filter((_index, element) => toPlainText(page(element).text()) === heading)
    .first()
    .parent();
  return section
    .find(itemSelector)
    .toArray()
    .map((element) => toPlainText(page(element).text()))
    .filter((text) => text.length > 0);
}

/** The href of the button labelled `label`, unless it is empty, `#` or not an http(s) URL. */
function findButtonUrl(page: CheerioAPI, label: string): string | undefined {
  const href = page('main a')
    .filter((_index, element) => toPlainText(page(element).text()) === label)
    .first()
    .attr('href')
    ?.trim();
  return href && /^https?:\/\//.test(href) ? href : undefined;
}

/** Key features, technologies and demo/code links of a rendered `/project/<slug>/` page. */
export function mapProjectPageToExtras(html: string): ProjectPageExtras {
  const page = load(html);
  const demoUrl = findButtonUrl(page, 'View Demo');
  const codeUrl = findButtonUrl(page, 'View Code');
  return {
    features: listSectionTexts(page, 'Key Features', 'p'),
    technologies: listSectionTexts(page, 'Technologies Used', 'span'),
    ...(demoUrl ? { demoUrl } : {}),
    ...(codeUrl ? { codeUrl } : {}),
  };
}
