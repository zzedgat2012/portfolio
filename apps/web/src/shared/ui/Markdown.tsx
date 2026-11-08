import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { buildProseClassName, PROSE_COMPONENTS } from './markdown-components';

type MarkdownProps = {
  /** Markdown source from a content file. */
  children: string;
  className?: string;
  /** Overrides for single elements. */
  components?: Components;
};

/**
 * Renders content Markdown (architecture D3): react-markdown + remark-gfm, raw HTML dropped
 * (`skipHtml`), never `dangerouslySetInnerHTML`. Server component; no client JavaScript.
 */
export function Markdown({ children, className, components }: MarkdownProps) {
  return (
    <div className={buildProseClassName(className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml={true}
        components={components ? { ...PROSE_COMPONENTS, ...components } : PROSE_COMPONENTS}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
