import { describe, expect, test } from 'vitest';
import {
  countMonthsInclusive,
  toDateRangeLabel,
  toDurationLabel,
  toLongDateLabel,
  toYearMonthLabel,
} from './date-labels';

describe('[story 2.2] date labels', () => {
  test('toYearMonthLabel renders a YYYY-MM month as "Mar 2025"', () => {
    expect(toYearMonthLabel('2025-03')).toBe('Mar 2025');
    expect(toYearMonthLabel('2017-12')).toBe('Dec 2017');
  });

  test('toDateRangeLabel joins start and end with an en dash, or says Present when open', () => {
    expect(toDateRangeLabel('2025-03', null)).toBe('Mar 2025 – Present');
    expect(toDateRangeLabel('2018-07', '2021-04')).toBe('Jul 2018 – Apr 2021');
  });

  test('countMonthsInclusive counts both the first and the last month', () => {
    expect(countMonthsInclusive('2023-09', '2023-11')).toBe(3);
    expect(countMonthsInclusive('2018-07', '2021-04')).toBe(34);
    expect(countMonthsInclusive('2024-05', '2024-05')).toBe(1);
  });

  test('toDurationLabel matches the mockup wording', () => {
    expect(toDurationLabel('2018-07', '2021-04')).toBe('2 years 10 months');
    expect(toDurationLabel('2022-12', '2023-09')).toBe('10 months');
    expect(toDurationLabel('2018-01', '2018-07')).toBe('7 months');
    expect(toDurationLabel('2024-05', '2024-05')).toBe('1 month');
    expect(toDurationLabel('2020-01', '2020-12')).toBe('1 year');
    expect(toDurationLabel('2020-01', '2021-01')).toBe('1 year 1 month');
    expect(toDurationLabel('2019-01', '2020-12')).toBe('2 years');
  });

  test('toLongDateLabel renders a calendar date in en-US long form', () => {
    expect(toLongDateLabel('2025-12-19')).toBe('December 19, 2025');
    expect(toLongDateLabel('2024-03-01')).toBe('March 1, 2024');
  });
});
