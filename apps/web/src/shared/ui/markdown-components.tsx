import type { Components } from 'react-markdown';

// Prose styles (DESIGN.md › Components › Prose): body in muted-foreground, mono headings in
// foreground, ▸ list markers in accent, inline code and code blocks from the code tokens.
export const PROSE_COMPONENTS: Components = {
  p: ({ node: _node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
  strong: ({ node: _node, ...props }) => (
    <strong className="font-mono font-bold text-foreground" {...props} />
  ),
  a: ({ node: _node, ...props }) => (
    <a
      className="text-foreground underline underline-offset-4 transition-colors duration-150 hover:text-accent"
      {...props}
    />
  ),
  h2: ({ node: _node, ...props }) => (
    <h2 className="mt-10 mb-4 font-mono text-2xl font-bold text-foreground" {...props} />
  ),
  h3: ({ node: _node, ...props }) => (
    <h3 className="mt-8 mb-3 font-mono text-xl font-bold text-foreground" {...props} />
  ),
  h4: ({ node: _node, ...props }) => (
    <h4 className="mt-6 mb-2 font-mono text-lg font-bold text-foreground" {...props} />
  ),
  ul: ({ node: _node, ...props }) => <ul className="mb-4 space-y-2" {...props} />,
  ol: ({ node: _node, ...props }) => (
    <ol className="mb-4 list-decimal space-y-2 pl-6 marker:text-accent" {...props} />
  ),
  li: ({ node: _node, ...props }) => (
    <li
      className="[ul>&]:relative [ul>&]:pl-5 [ul>&]:before:absolute [ul>&]:before:left-0 [ul>&]:before:text-accent [ul>&]:before:content-['▸']"
      {...props}
    />
  ),
  blockquote: ({ node: _node, ...props }) => (
    <blockquote
      className="mb-4 rounded-r-sm border-l-2 border-accent/50 bg-secondary/40 py-3 pr-4 pl-4 italic"
      {...props}
    />
  ),
  code: ({ node: _node, ...props }) => (
    <code
      className="rounded-code bg-secondary px-2 py-0.5 font-mono text-[0.9em] text-accent [pre>&]:bg-transparent [pre>&]:p-0 [pre>&]:text-code-ink"
      {...props}
    />
  ),
  pre: ({ node: _node, ...props }) => (
    <pre
      className="mb-4 overflow-x-auto bg-code-surface p-4 font-mono text-sm [figure>&]:mb-0"
      {...props}
    />
  ),
  hr: ({ node: _node, ...props }) => <hr className="my-8 border-border/30" {...props} />,
  table: ({ node: _node, ...props }) => (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm" {...props} />
    </div>
  ),
  th: ({ node: _node, ...props }) => (
    <th className="border-b border-border px-3 py-2 font-mono text-foreground" {...props} />
  ),
  td: ({ node: _node, ...props }) => (
    <td className="border-b border-border/30 px-3 py-2" {...props} />
  ),
};

/** Wrapper classes of rendered Markdown: body text in muted-foreground. */
export function buildProseClassName(className: string | undefined): string {
  return ['text-muted-foreground', className].filter(Boolean).join(' ');
}
