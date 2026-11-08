import type { Element } from 'hast';
import type { ReactNode } from 'react';
import { toCodeBlockParts } from '@/shared/lib';
import { CopyButton } from './CopyButton';

type CodeBlockProps = {
  /** The `<figure>` rehype-pretty-code emitted at build time. */
  node: Element;
  /** The rendered, highlighted `<pre>` (its original figcaption is dropped by the renderer). */
  children: ReactNode;
};

/**
 * A highlighted fenced block (DESIGN.md › code-block): a header bar with the `title=` filename,
 * a Copy button, and the code. The figcaption names the figure for assistive technology.
 */
export function CodeBlock({ node, children }: CodeBlockProps) {
  const { title, code } = toCodeBlockParts(node);

  return (
    <figure className="relative mb-6 overflow-hidden rounded-2xl border border-border/40 bg-code-surface">
      {title === null ? (
        <div aria-hidden="true" className="h-9 bg-secondary/60" />
      ) : (
        <figcaption className="flex h-9 items-center bg-secondary/60 pr-24 pl-4 font-mono text-xs text-muted-foreground">
          {title}
        </figcaption>
      )}
      <CopyButton
        text={code}
        className="absolute top-1.5 right-2 rounded-code px-2 py-1 font-mono text-xs text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground"
      >
        Copy<span className="sr-only"> code</span>
      </CopyButton>
      {children}
    </figure>
  );
}
