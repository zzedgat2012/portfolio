import type { Experience } from '@/features/profile';
import { toDateRangeLabel, toDurationLabel } from '@/shared/lib';

export type HeroTitleParts = { lead: string; rest: string };

export type ExperienceRow = {
  company: string;
  role: string;
  /** `Mar 2025 – Present`. */
  dateRange: string;
  /** `Current` for an open range, else the duration (`2 years 10 months`). */
  detail: string;
  isCurrent: boolean;
};

const CURRENT_LABEL = 'Current';

/** The mockup sets the first word of the hero title on the left and the rest on the right. */
export function toHeroTitleParts(heroTitle: string): HeroTitleParts {
  const [lead = '', ...rest] = heroTitle.trim().split(/\s+/);
  return { lead, rest: rest.join(' ') };
}

export function toExperienceRow(experience: Experience): ExperienceRow {
  return {
    company: experience.company,
    role: experience.role,
    dateRange: toDateRangeLabel(experience.startOn, experience.endOn),
    detail:
      experience.endOn === null
        ? CURRENT_LABEL
        : toDurationLabel(experience.startOn, experience.endOn),
    isCurrent: experience.isCurrent,
  };
}

export function toProjectCountLabel(count: number): string {
  return `${count} project${count === 1 ? '' : 's'}`;
}
