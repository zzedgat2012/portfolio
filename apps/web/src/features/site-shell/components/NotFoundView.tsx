import { House } from 'lucide-react';
import Link from 'next/link';
import { CircleAccent } from '@/shared/ui';
import { AttemptedPath } from './AttemptedPath';
import { ErrorStamp } from './ErrorStamp';
import { GoBackButton } from './GoBackButton';

/** Home sections offered on the 404 page (`Work` is the experience section). */
const SUGGESTIONS = [
  { label: 'Projects', href: '/#projects' },
  { label: 'About', href: '/#about' },
  { label: 'Work', href: '/#experience' },
] as const;

const PILL =
  'inline-flex items-center gap-3 rounded-full px-8 py-4 text-base transition-colors duration-150';

/** Full-screen not-found page per the `404 — desktop/mobile` mockups (no site header). */
export function NotFoundView() {
  return (
    <main
      id="main-content"
      className="relative flex flex-1 flex-col items-center overflow-hidden px-4 pt-24 pb-16 text-center md:pt-32"
    >
      <CircleAccent className="top-0 -right-40 size-96 md:top-20 md:-right-24" />
      <CircleAccent className="bottom-24 -left-36 size-72" />

      <div className="relative grid place-items-center py-8 md:py-16">
        <span
          aria-hidden="true"
          className="scale-150 font-mono text-9xl leading-none font-bold text-card/50 select-none md:scale-200"
        >
          404
        </span>
        <h1 className="absolute font-mono text-6xl font-bold text-foreground md:text-8xl">404</h1>
      </div>

      <p className="mt-16 font-mono text-xs tracking-eyebrow text-muted-foreground uppercase md:mt-20">
        Page not found
      </p>
      <p className="mt-4 text-2xl text-foreground">
        <span className="block">
          Looks like you&apos;ve ventured into the <em className="text-muted-foreground">void</em>.
        </span>
        <span className="block">The page you&apos;re looking for doesn&apos;t exist.</span>
      </p>

      <div className="mt-8 min-h-9">
        <AttemptedPath />
      </div>

      <div className="mt-12 flex flex-col items-center gap-4 md:flex-row">
        <Link href="/" className={`${PILL} bg-primary text-primary-foreground hover:bg-primary/90`}>
          <House aria-hidden="true" size={16} />
          Back to Home
        </Link>
        <GoBackButton
          className={`${PILL} border border-input bg-background text-foreground hover:bg-secondary/60`}
        />
      </div>

      <nav aria-label="Suggested pages" className="mt-24">
        <p className="text-sm text-muted-foreground">You might be looking for:</p>
        <ul className="mt-4 flex flex-wrap justify-center gap-3">
          {SUGGESTIONS.map((suggestion) => (
            <li key={suggestion.href}>
              <Link
                href={suggestion.href}
                className="inline-block rounded-full bg-secondary/60 px-4 py-2 font-mono text-sm text-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground"
              >
                {suggestion.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-20">
        <ErrorStamp />
      </div>
    </main>
  );
}
