import type { Components } from 'react-markdown';
import { MarkdownAsync } from 'react-markdown';
import rehypePrettyCode, { type Options as PrettyCodeOptions } from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';
import { buildProseClassName, PROSE_COMPONENTS } from './markdown-components';

type HighlightedMarkdownProps = {
  /** Markdown source from a content file. */
  children: string;
  className?: string;
};

/**
 * Shiki theme whose surface and ink are exactly DESIGN.md's `code-surface` (#1E1E1E) and
 * `code-ink` (#D4D4D4). The background comes from the token, not the theme.
 */
const PRETTY_CODE_OPTIONS: PrettyCodeOptions = {
  theme: 'dark-plus',
  keepBackground: false,
  bypassInlineCode: true,
  // Fences without a language still get the code-block frame and a Copy button.
  defaultLang: { block: 'plaintext' },
};

// rehype-pretty-code sets these hast properties under their literal attribute names.
const PRETTY_CODE_FIGURE = 'data-rehype-pretty-code-figure';
const PRETTY_CODE_TITLE = 'data-rehype-pretty-code-title';

const HIGHLIGHTED_COMPONENTS: Components = {
  ...PROSE_COMPONENTS,
  figure: ({ node, children, ...props }) =>
    node && PRETTY_CODE_FIGURE in node.properties ? (
      <CodeBlock node={node}>{children}</CodeBlock>
    ) : (
      <figure {...props}>{children}</figure>
    ),
  // CodeBlock renders the title itself, inside its header bar.
  figcaption: ({ node, ...props }) =>
    node && PRETTY_CODE_TITLE in node.properties ? null : <figcaption {...props} />,
};

/**
 * Markdown with fenced code highlighted at build time (architecture D3): react-markdown +
 * remark-gfm + rehype-pretty-code (Shiki). Async Server Component: the highlighter never ships to
 * the browser; only the Copy button is client JavaScript. Raw HTML is dropped (`skipHtml`).
 */
export async function HighlightedMarkdown({ children, className }: HighlightedMarkdownProps) {
  return (
    <div className={buildProseClassName(className)}>
      <MarkdownAsync
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypePrettyCode, PRETTY_CODE_OPTIONS]]}
        skipHtml={true}
        components={HIGHLIGHTED_COMPONENTS}
      >
        {children}
      </MarkdownAsync>
    </div>
  );
}
