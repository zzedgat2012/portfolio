import type { ProfileFile } from '@portfolio/contracts';
import type { Profile } from '../model';

export function toProfile(file: ProfileFile): Profile {
  return {
    name: file.name,
    role: file.role,
    location: file.location,
    heroTitle: file.heroTitle,
    heroTagline: file.heroTagline,
    portrait: { src: file.portrait, alt: file.portraitAlt },
    bio: file.bio,
    technologies: file.technologies,
    whatIDo: file.whatIDo,
    education: file.education,
    certifications: file.certifications.map(({ year, title }) => ({ year, title })),
    experience: file.experience.map(({ company, role, startOn, endOn }) => ({
      company,
      role,
      startOn,
      endOn: endOn ?? null,
      isCurrent: endOn === undefined,
    })),
    experienceSummary: file.experienceSummary,
    contact: { ...file.contact },
    links: file.links.map((link) => ({ ...link })),
  };
}
