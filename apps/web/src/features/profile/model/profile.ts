import type { LinkIcon } from '@portfolio/contracts';
import type { ContentImage } from '@/shared/lib';

export type Certification = { year: number; title: string };

export type Experience = {
  company: string;
  role: string;
  /** `YYYY-MM`. */
  startOn: string;
  /** `YYYY-MM`, or `null` while current. */
  endOn: string | null;
  isCurrent: boolean;
};

export type ContactDetails = {
  phone: string;
  email: string;
  website: string;
  languages: string;
};

export type ProfileLink = {
  label: string;
  url: string;
  icon: LinkIcon;
  showInHero: boolean;
  showInContact: boolean;
};

/** Edgar's profile (`content/settings/profile.yml`): home page, CV and author blocks. */
export type Profile = {
  name: string;
  role: string;
  location: string;
  heroTitle: string;
  heroTagline: string;
  portrait: ContentImage;
  /** Markdown. */
  bio: string;
  technologies: string[];
  whatIDo: string[];
  education: string[];
  certifications: Certification[];
  /** In file order (newest first by convention). */
  experience: Experience[];
  experienceSummary: string;
  contact: ContactDetails;
  links: ProfileLink[];
};
