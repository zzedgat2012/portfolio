/** Collapses runs of whitespace (including newlines and nbsp) into single spaces and trims. */
export function toPlainText(text: string): string {
  return text.replace(/[\s ]+/g, ' ').trim();
}

/** `Product Design — Design Circuit` → `Product Design (Design Circuit)`, as in the CV mockup. */
export function toParenthetical(text: string): string {
  const [main, ...rest] = text.split(' — ');
  return rest.length === 0 ? text : `${main} (${rest.join(' — ')})`;
}
