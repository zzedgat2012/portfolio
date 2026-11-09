import type { Metadata } from 'next';
import { listArticles } from '@/features/articles';
import { CV_PDF_FILE_NAME, CV_PDF_PATH } from '@/features/cv';
import {
  AboutSection,
  ArticlesSection,
  ContactSection,
  ExperienceSection,
  FeaturedProjectsCarousel,
  HomeHero,
  ProjectsSection,
  toFeaturedSlide,
} from '@/features/home';
import { findProfileLinkByIcon, getProfile } from '@/features/profile';
import { listProjects } from '@/features/projects';
import { buildPersonJsonLd, HOME_PATH } from '@/features/seo';
import { getSiteSettings } from '@/features/settings';
import { buildPageMetadata } from '@/shared/lib';
import { JsonLd } from '@/shared/ui';

export async function generateMetadata(): Promise<Metadata> {
  const [profile, settings] = await Promise.all([getProfile(), getSiteSettings()]);
  return buildPageMetadata({
    title: null,
    description: settings.description,
    siteName: settings.siteName,
    siteUrl: settings.siteUrl,
    path: HOME_PATH,
    image: profile.portrait,
  });
}

/** Home (D1): hero, featured carousel and the #about … #contact sections. */
export default async function HomeRoute() {
  const [profile, projects, articles, settings] = await Promise.all([
    getProfile(),
    listProjects(),
    listArticles(),
    getSiteSettings(),
  ]);
  const featuredSlides = projects.filter((project) => project.isFeatured).map(toFeaturedSlide);

  return (
    <>
      <JsonLd data={buildPersonJsonLd(profile, settings.siteUrl)} />
      <HomeHero
        heroTitle={profile.heroTitle}
        heroTagline={profile.heroTagline}
        links={profile.links.filter((link) => link.showInHero)}
      />
      {featuredSlides.length > 0 ? <FeaturedProjectsCarousel slides={featuredSlides} /> : null}
      <AboutSection profile={profile} />
      <ExperienceSection
        experience={profile.experience}
        experienceSummary={profile.experienceSummary}
        cvHref={CV_PDF_PATH}
        cvFileName={CV_PDF_FILE_NAME}
      />
      <ProjectsSection
        projects={projects}
        githubUrl={findProfileLinkByIcon(profile.links, 'github')?.url ?? null}
      />
      <ArticlesSection articles={articles} />
      <ContactSection
        profile={profile}
        links={profile.links.filter((link) => link.showInContact)}
      />
    </>
  );
}
