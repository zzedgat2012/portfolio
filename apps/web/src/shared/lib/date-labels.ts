// Date labels (architecture D3): en-US, rendered at build time in UTC so the output never
// depends on the build machine's time zone.

const LOCALE = 'en-US';
const PRESENT_LABEL = 'Present';

const yearMonthFormat = new Intl.DateTimeFormat(LOCALE, {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const longDateFormat = new Intl.DateTimeFormat(LOCALE, {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

function toMonthNumber(yearMonth: string): number {
  const [year = 0, month = 1] = yearMonth.split('-').map(Number);
  return year * 12 + (month - 1);
}

function pluralise(count: number, unit: string): string {
  return `${count} ${unit}${count === 1 ? '' : 's'}`;
}

/** `2025-03` → `Mar 2025`. */
export function toYearMonthLabel(yearMonth: string): string {
  return yearMonthFormat.format(new Date(`${yearMonth}-01T00:00:00Z`));
}

/** `2025-12-19` → `December 19, 2025`. */
export function toLongDateLabel(isoDate: string): string {
  return longDateFormat.format(new Date(`${isoDate}T00:00:00Z`));
}

/** `Mar 2025 – Present` for an open range, `Jul 2018 – Apr 2021` otherwise. */
export function toDateRangeLabel(startOn: string, endOn: string | null): string {
  return `${toYearMonthLabel(startOn)} – ${endOn === null ? PRESENT_LABEL : toYearMonthLabel(endOn)}`;
}

/** Months covered by a `YYYY-MM` range, counting the first and the last month. */
export function countMonthsInclusive(startOn: string, endOn: string): number {
  return toMonthNumber(endOn) - toMonthNumber(startOn) + 1;
}

/** `2 years 10 months`, `7 months`, `1 year` for a closed `YYYY-MM` range (inclusive). */
export function toDurationLabel(startOn: string, endOn: string): string {
  const months = countMonthsInclusive(startOn, endOn);
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  return [
    years > 0 ? pluralise(years, 'year') : '',
    remainder > 0 ? pluralise(remainder, 'month') : '',
  ]
    .filter(Boolean)
    .join(' ');
}
