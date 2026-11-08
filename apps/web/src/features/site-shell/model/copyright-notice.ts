/** Footer line, e.g. `© 2026 Edgar Ferreira. All rights reserved.` */
export function buildCopyrightNotice(ownerName: string, year: number): string {
  return `© ${year} ${ownerName}. All rights reserved.`;
}
