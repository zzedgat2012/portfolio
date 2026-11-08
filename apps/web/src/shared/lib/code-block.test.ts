import type { Element } from 'hast';
import { describe, expect, test } from 'vitest';
import { toCodeBlockParts } from './code-block';

/** The hast shape rehype-pretty-code emits for a fenced block (figure > figcaption? + pre > code). */
function buildFigure(title: string | null, lines: string[]): Element {
  const pre: Element = {
    type: 'element',
    tagName: 'pre',
    properties: { 'data-language': 'js' },
    children: [
      {
        type: 'element',
        tagName: 'code',
        properties: { 'data-language': 'js' },
        children: lines.flatMap((line, index) => [
          ...(index > 0 ? [{ type: 'text' as const, value: '\n' }] : []),
          {
            type: 'element' as const,
            tagName: 'span',
            properties: { 'data-line': '' },
            children: [
              {
                type: 'element' as const,
                tagName: 'span',
                properties: { style: 'color:#569CD6' },
                children: [{ type: 'text' as const, value: line }],
              },
            ],
          },
        ]),
      },
    ],
  };
  const caption: Element[] =
    title === null
      ? []
      : [
          {
            type: 'element',
            tagName: 'figcaption',
            properties: { 'data-rehype-pretty-code-title': '' },
            children: [{ type: 'text', value: title }],
          },
        ];
  return {
    type: 'element',
    tagName: 'figure',
    properties: { 'data-rehype-pretty-code-figure': '' },
    children: [...caption, pre],
  };
}

describe('[story 2.4] toCodeBlockParts', () => {
  test('reads the filename that rehype-pretty-code parsed from the title= meta', () => {
    const parts = toCodeBlockParts(buildFigure('worker.js', ['export default {};']));

    expect(parts.title).toBe('worker.js');
  });

  test('has no title when the fence had no title= meta', () => {
    expect(toCodeBlockParts(buildFigure(null, ['select 1 from dual;'])).title).toBeNull();
  });

  test('returns the plain code text, one line per source line, for the Copy button', () => {
    const parts = toCodeBlockParts(buildFigure(null, ['const a = 1;', '  return a;']));

    expect(parts.code).toBe('const a = 1;\n  return a;');
  });
});
