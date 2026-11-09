import type { Metadata } from 'next';
import { getProfile } from '@/features/profile';
import {
  buildProjectPath,
  getProjectBySlug,
  listProjects,
  ProjectDetail,
} from '@/features/projects';
import { buildProjectJsonLd } from '@/features/seo';
import { getSiteSettings } from '@/features/settings';
import { buildPageMetadata } from '@/shared/lib';
import { JsonLd, ReadingProgress } from '@/shared/ui';

type ProjectRouteProps = { params: Promise<{ slug: string }> };

/** Unknown slugs are not generated, so they 404 (the export's 404.html). */
export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return (await listProjects()).map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const [project, settings] = await Promise.all([getProjectBySlug(slug), getSiteSettings()]);
  return buildPageMetadata({
    title: project.title,
    description: project.summary,
    siteName: settings.siteName,
    siteUrl: settings.siteUrl,
    path: buildProjectPath(slug),
    image: project.coverImage,
  });
}

/** `/project/<slug>/` (architecture D1). */
export default async function ProjectRoute({ params }: ProjectRouteProps) {
  const { slug } = await params;
  const [project, profile, settings] = await Promise.all([
    getProjectBySlug(slug),
    getProfile(),
    getSiteSettings(),
  ]);
  return (
    <>
      <JsonLd data={buildProjectJsonLd(project, profile, settings.siteUrl)} />
      <ReadingProgress />
      <ProjectDetail project={project} />
    </>
  );
}
