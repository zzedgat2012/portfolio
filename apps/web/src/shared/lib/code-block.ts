import type { Element, ElementContent } from 'hast';

/** What a code-block renderer needs from a figure emitted by rehype-pretty-code. */
export type CodeBlockParts = {
  /** Filename from the fence's `title="…"` meta (parsed by rehype-pretty-code), or null. */
  title: string | null;
  /** Plain source text, for the Copy button. */
  code: string;
};

function toText(node: ElementContent): string {
  if (node.type === 'text') {
    return node.value;
  }
  if (node.type === 'element') {
    return node.children.map(toText).join('');
  }
  return '';
}

function findChild(parent: Element, tagName: string): Element | undefined {
  return parent.children.find(
    (child): child is Element => child.type === 'element' && child.tagName === tagName,
  );
}

/** Splits a rehype-pretty-code `<figure>` (figcaption? + pre > code) into title and plain code. */
export function toCodeBlockParts(figure: Element): CodeBlockParts {
  const caption = findChild(figure, 'figcaption');
  const pre = findChild(figure, 'pre');
  return {
    title: caption ? toText(caption) : null,
    code: pre ? toText(pre) : '',
  };
}
