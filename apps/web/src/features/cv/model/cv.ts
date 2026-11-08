import type { Profile } from '@/features/profile';
import type { SiteSettings } from '@/features/settings';
import { toDateRangeLabel, toWebsiteLabel } from '@/shared/lib';

const SEPARATOR = ' • ';
const GENERATED_NOTE = 'Generated from the site';

export type CvExperienceRow = {
  company: string;
  role: string;
  /** `Mar 2025 – Present`. */
  dateRange: string;
};

/** The printable CV (`/cv/` and its PDF), built from the profile. */
export type Cv = {
  name: string;
  role: string;
  /** `Aracaju, Sergipe, Brazil • (79) 98835-9686 • edgar-ferreira.com`. */
  contactLine: string;
  /** Markdown (the profile bio). */
  summary: string;
  /** Technologies joined with bullets. */
  skills: string;
  experience: CvExperienceRow[];
  education: string[];
  /** `2021 · Oracle APEX Developer (Oracle)`. */
  certifications: string[];
  /** `edgar-ferreira.com • Generated from the site`. */
  footer: string;
};

export function toCv(profile: Profile, settings: SiteSettings): Cv {
  return {
    name: profile.name,
    role: profile.role,
    contactLine: [profile.location, profile.contact.phone, toWebsiteLabel(profile.contact.website)]
      .filter((part) => part.trim() !== '')
      .join(SEPARATOR),
    summary: profile.bio,
    skills: profile.technologies.join(SEPARATOR),
    experience: profile.experience.map((experience) => ({
      company: experience.company,
      role: experience.role,
      dateRange: toDateRangeLabel(experience.startOn, experience.endOn),
    })),
    education: profile.education,
    certifications: profile.certifications.map(
      (certification) => `${certification.year} · ${certification.title}`,
    ),
    footer: `${toWebsiteLabel(settings.siteUrl)}${SEPARATOR}${GENERATED_NOTE}`,
  };
}
