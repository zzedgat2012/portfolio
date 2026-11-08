import Link from 'next/link';

export default function NotFoundRoute() {
  return (
    <main className="container mx-auto p-4 pt-16">
      <h1 className="font-mono text-4xl font-semibold">Page not found</h1>
      <p className="mt-4 text-muted-foreground">The requested page could not be found.</p>
      <Link className="mt-8 inline-block underline" href="/">
        Back to the home page
      </Link>
    </main>
  );
}
