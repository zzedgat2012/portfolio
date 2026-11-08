import { describe, expect, test } from 'vitest';
import type { Experience } from '@/features/profile';
import {
  toExperienceRow,
  toHeroTitleParts,
  toProjectCountLabel,
  toWebsiteLabel,
} from './home-labels';

describe('[story 2.2] home labels', () => {
  test('toHeroTitleParts splits the hero title after the first word', () => {
    expect(toHeroTitleParts('Product Engineer')).toEqual({ lead: 'Product', rest: 'Engineer' });
    expect(toHeroTitleParts('  Senior   Product Engineer ')).toEqual({
      lead: 'Senior',
      rest: 'Product Engineer',
    });
    expect(toHeroTitleParts('Engineer')).toEqual({ lead: 'Engineer', rest: '' });
  });

  test('toExperienceRow labels an open range as Current', () => {
    const current: Experience = {
      company: 'Memora',
      role: 'Oracle APEX Developer',
      startOn: '2025-03',
      endOn: null,
      isCurrent: true,
    };
    expect(toExperienceRow(current)).toEqual({
      company: 'Memora',
      role: 'Oracle APEX Developer',
      dateRange: 'Mar 2025 – Present',
      detail: 'Current',
      isCurrent: true,
    });
  });

  test('toExperienceRow labels a closed range with its duration', () => {
    const past: Experience = {
      company: 'EightSystems',
      role: 'Oracle APEX Developer',
      startOn: '2018-07',
      endOn: '2021-04',
      isCurrent: false,
    };
    expect(toExperienceRow(past)).toMatchObject({
      dateRange: 'Jul 2018 – Apr 2021',
      detail: '2 years 10 months',
      isCurrent: false,
    });
  });

  test('toWebsiteLabel drops the protocol, www-less host kept, and trailing slash', () => {
    expect(toWebsiteLabel('https://edgar-ferreira.com')).toBe('edgar-ferreira.com');
    expect(toWebsiteLabel('https://edgar-ferreira.com/')).toBe('edgar-ferreira.com');
    expect(toWebsiteLabel('http://example.com/path/')).toBe('example.com/path');
  });

  test('toProjectCountLabel pluralises', () => {
    expect(toProjectCountLabel(1)).toBe('1 project');
    expect(toProjectCountLabel(3)).toBe('3 projects');
  });
});
