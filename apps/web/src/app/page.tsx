import { getSiteSettings } from '@/features/settings';

export default async function HomeRoute() {
  const settings = await getSiteSettings();

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1 className="font-mono text-4xl font-semibold">{settings.siteName}</h1>
    </main>
  );
}
