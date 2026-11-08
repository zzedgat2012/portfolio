import { describe, expect, test } from 'vitest';
import { CV_PAGE_PATH, CV_PDF_FILE_NAME, CV_PDF_PATH } from './cv-pdf';

describe('[story 2.5] CV PDF location', () => {
  test('the PDF is served from the site root under its download file name', () => {
    expect(CV_PDF_FILE_NAME).toBe('edgar-ferreira-cv.pdf');
    expect(CV_PDF_PATH).toBe('/edgar-ferreira-cv.pdf');
  });

  test('the PDF is rendered from the trailing-slash CV route', () => {
    expect(CV_PAGE_PATH).toBe('/cv/');
  });
});
