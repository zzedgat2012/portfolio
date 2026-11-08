// Where the CV PDF lives (architecture D4). Shared by the home "Download CV" link and
// `scripts/postbuild.ts`, which renders CV_PAGE_PATH to out/CV_PDF_FILE_NAME after `next build`.
// Dependency-free on purpose: the postbuild script runs outside Next.js.

/** File name of the generated PDF, also the name the browser saves it under. */
export const CV_PDF_FILE_NAME = 'edgar-ferreira-cv.pdf';

/** Public URL of the generated PDF. */
export const CV_PDF_PATH = `/${CV_PDF_FILE_NAME}`;

/** Route of the printable CV page the PDF is rendered from. */
export const CV_PAGE_PATH = '/cv/';
