import { parse, stringify } from 'yaml';

const YAML_OPTIONS = { lineWidth: 0 } as const;

/** A YAML data file (`tags/<slug>.yml`, `settings/*.yml`). */
export function toYamlDocument(data: unknown): string {
  return stringify(data, YAML_OPTIONS);
}

/** A Markdown file with YAML frontmatter, laid out like the files Decap writes. */
export function toMarkdownDocument(data: unknown, body: string): string {
  const trimmedBody = body.trim();
  return `---\n${stringify(data, YAML_OPTIONS)}---\n${trimmedBody === '' ? '' : `${trimmedBody}\n`}`;
}

/** The frontmatter of a Markdown document, or `null` when it has none. */
export function readFrontmatter(contents: string): unknown {
  const match = /^---\n([\s\S]*?)\n?---\n/.exec(contents);
  return match ? (parse(match[1] ?? '') as unknown) : null;
}
