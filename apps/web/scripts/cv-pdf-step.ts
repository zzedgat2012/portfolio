import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { ValidationError } from '@portfolio/contracts';
import { CV_PAGE_PATH, CV_PDF_FILE_NAME } from '../src/features/cv/model/cv-pdf';
import type { PostbuildStep } from './postbuild-steps';
import { startStaticServer } from './static-server';

const PDF_SIGNATURE = '%PDF-';

export type CvPdfTarget = {
  /** The CV page on the local static server. */
  pageUrl: string;
  /** Where the PDF is written, next to the exported pages. */
  pdfPath: string;
};

export function buildCvPdfTarget(outDir: string, origin: string): CvPdfTarget {
  return {
    pageUrl: `${origin}${CV_PAGE_PATH}`,
    pdfPath: path.join(outDir, CV_PDF_FILE_NAME),
  };
}

export function assertPdfBytes(bytes: Buffer): void {
  if (bytes.subarray(0, PDF_SIGNATURE.length).toString('latin1') !== PDF_SIGNATURE) {
    throw new ValidationError(`generated CV is not a PDF (${bytes.length} bytes)`);
  }
}

/**
 * D4 step 2: serves `out/` on a throwaway loopback server and prints `/cv/` to
 * `out/edgar-ferreira-cv.pdf` (A4, `@page` margins from the page CSS) with Playwright Chromium.
 */
export const cvPdfStep: PostbuildStep = {
  name: 'cv-pdf',
  run: async ({ outDir }) => {
    const server = await startStaticServer(outDir);
    const browser = await chromium.launch().catch(async (error: unknown) => {
      await server.close();
      throw error;
    });
    try {
      const { pageUrl, pdfPath } = buildCvPdfTarget(outDir, server.origin);
      const page = await browser.newPage();
      const response = await page.goto(pageUrl, { waitUntil: 'networkidle' });
      if (!response?.ok()) {
        throw new ValidationError(`${pageUrl} answered ${response?.status() ?? 'nothing'}`);
      }
      await page.evaluate(async () => {
        await document.fonts.ready;
      });
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
      });
      assertPdfBytes(await readFile(pdfPath));
    } finally {
      await browser.close();
      await server.close();
    }
  },
};
