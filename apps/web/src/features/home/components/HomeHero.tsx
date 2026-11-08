import { ArrowRight } from 'lucide-react';
import { type ProfileLink, ProfileLinkIcon } from '@/features/profile';
import { CircleAccent, Container } from '@/shared/ui';
import { toHeroTitleParts } from '../model';

type HomeHeroProps = {
  heroTitle: string;
  heroTagline: string;
  /** Profile links flagged `showInHero`, in file order. */
  links: ProfileLink[];
};

const DISPLAY_CLASS =
  'font-mono text-6xl leading-[0.9] font-bold tracking-tight sm:text-7xl lg:text-8xl';

/**
 * Hero (Home mockups): title split over two lines ("Product" left, "Engineer" right on desktop),
 * tagline, "View Products" CTA to `#projects`, and the hero links (icon-only on mobile).
 * The h1 always carries the whole title; the right-hand word on desktop is decorative.
 */
export function HomeHero({ heroTitle, heroTagline, links }: HomeHeroProps) {
  const { lead, rest } = toHeroTitleParts(heroTitle);

  return (
    <div className="relative overflow-hidden">
      <CircleAccent className="-top-40 -right-40 size-[28rem]" />
      <Container className="relative pt-10 md:pt-16">
        <div className="grid gap-6 md:grid-cols-2 md:gap-x-12">
          <h1 className={DISPLAY_CLASS}>
            <span className="block">{lead}</span>
            {rest ? <span className="block md:sr-only"> {rest}</span> : null}
          </h1>
          <div className="order-2 flex items-center gap-3 md:order-none md:justify-end md:self-start">
            <a href="#projects" className="group inline-flex items-center gap-3 rounded-full">
              <span className="w-56 rounded-full bg-off-white px-10 py-5 text-center font-mono text-base text-background shadow-cta-inset transition-colors duration-150 group-hover:bg-pill-hover md:w-auto md:py-4">
                View Products
              </span>
              <span
                aria-hidden="true"
                className="grid size-12 place-items-center rounded-full border border-border/60 bg-background text-muted-foreground transition-colors duration-150 group-hover:bg-secondary group-hover:text-foreground"
              >
                <ArrowRight size={20} />
              </span>
            </a>
          </div>
          <p className="order-1 max-w-xl text-lg leading-relaxed text-muted-foreground md:order-none">
            {heroTagline}
          </p>
          {rest ? (
            <p aria-hidden="true" className={`hidden text-right md:block ${DISPLAY_CLASS}`}>
              {rest}
            </p>
          ) : null}
        </div>
        {links.length > 0 ? (
          <ul
            aria-label="Profile links"
            className="mt-10 flex flex-wrap items-center justify-between gap-3 md:mt-12 md:justify-around"
          >
            {links.map((link) => (
              <li key={`${link.label}-${link.url}`}>
                <a
                  href={link.url}
                  className="inline-flex size-12 items-center justify-center gap-2 rounded-full border border-border/50 bg-background text-sm font-medium text-foreground transition-colors duration-150 hover:bg-secondary md:size-auto md:px-5 md:py-2.5"
                >
                  <ProfileLinkIcon icon={link.icon} />
                  <span className="sr-only md:not-sr-only">{link.label}</span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </Container>
    </div>
  );
}
