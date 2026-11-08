import TurndownService from 'turndown';

/** Code languages WordPress emits that mean "no highlighting"; their fences get no language. */
const PLAIN_LANGUAGES = new Set(['plaintext', 'text', 'plain', 'none']);

function findCodeLanguage(code: HTMLElement): string | null {
  const match = /(?:^|\s)lang(?:uage)?-(\S+)/.exec(code.getAttribute('class') ?? '');
  const language = match?.[1]?.toLowerCase() ?? null;
  return language === null || PLAIN_LANGUAGES.has(language) ? null : language;
}

function buildFence(code: string): string {
  const longestRun = Math.max(0, ...(code.match(/`+/g) ?? []).map((run) => run.length));
  return '`'.repeat(Math.max(3, longestRun + 1));
}

function createTurndown(): TurndownService {
  const service = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '_',
    strongDelimiter: '**',
    hr: '---',
  });

  service.addRule('fencedCodeWithLanguage', {
    filter: (node) => node.nodeName === 'PRE' && node.firstElementChild?.nodeName === 'CODE',
    replacement: (_content, node) => {
      const code = (node as HTMLElement).firstElementChild as HTMLElement;
      const text = (code.textContent ?? '').replace(/\n$/, '');
      const fence = buildFence(text);
      return `\n\n${fence}${findCodeLanguage(code) ?? ''}\n${text}\n${fence}\n\n`;
    },
  });

  // Turndown pads list markers to four columns ("-   item"); write "- item" / "1. item" instead.
  service.addRule('compactListItem', {
    filter: 'li',
    replacement: (content, node) => {
      const parent = node.parentNode as HTMLElement | null;
      let prefix = '- ';
      if (parent?.nodeName === 'OL') {
        const start = Number(parent.getAttribute('start') ?? '1');
        prefix = `${start + Array.prototype.indexOf.call(parent.children, node)}. `;
      }
      const indent = ' '.repeat(prefix.length);
      const body = content
        .replace(/^\n+/, '')
        .replace(/\n+$/, '\n')
        .replace(/\n(?!$)/gm, `\n${indent}`);
      return prefix + body + (node.nextSibling && !body.endsWith('\n') ? '\n' : '');
    },
  });

  return service;
}

const turndown = createTurndown();

/** WordPress-rendered HTML to Markdown: ATX headings, `-` bullets, fenced code with language. */
export function toMarkdown(html: string): string {
  return turndown.turndown(html).trim();
}
