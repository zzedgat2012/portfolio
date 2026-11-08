import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { assertPdfBytes, buildCvPdfTarget } from './cv-pdf-step';

describe('[story 2.5] buildCvPdfTarget', () => {
  test('renders /cv/ from the local server into out/edgar-ferreira-cv.pdf', () => {
    expect(buildCvPdfTarget('/srv/out', 'http://127.0.0.1:4321')).toEqual({
      pageUrl: 'http://127.0.0.1:4321/cv/',
      pdfPath: path.join('/srv/out', 'edgar-ferreira-cv.pdf'),
    });
  });
});

describe('[story 2.5] assertPdfBytes', () => {
  test('accepts a buffer that starts with the PDF signature', () => {
    expect(() => assertPdfBytes(Buffer.from('%PDF-1.4\n...'))).not.toThrow();
  });

  test('rejects an empty or non-PDF buffer', () => {
    expect(() => assertPdfBytes(Buffer.alloc(0))).toThrow('not a PDF');
    expect(() => assertPdfBytes(Buffer.from('<html>'))).toThrow('not a PDF');
  });
});
