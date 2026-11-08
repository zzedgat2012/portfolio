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

/** Home (D1): hero, featured carousel and the #about … #contact sections. */
export default async function HomeRoute() {
  const [profile, projects, articles] = await Promise.all([
    getProfile(),
    listProjects(),
    listArticles(),
  ]);
  const featuredSlides = projects.filter((project) => project.isFeatured).map(toFeaturedSlide);

  return (
    <>
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
