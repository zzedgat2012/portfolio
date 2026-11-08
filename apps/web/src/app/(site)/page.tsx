import { getSiteSettings } from '@/features/settings';
import { Container } from '@/shared/ui';

// Placeholder until story 2.2 builds the home sections.
export default async function HomeRoute() {
  const settings = await getSiteSettings();

  return (
    <Container className="pt-16">
      <h1 className="font-mono text-4xl font-semibold">{settings.siteName}</h1>
    </Container>
  );
}
