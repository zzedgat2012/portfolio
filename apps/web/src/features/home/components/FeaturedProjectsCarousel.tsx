'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useState,
} from 'react';
import { ArrowPillLink, Container } from '@/shared/ui';
// Client component: import the pure modules directly, not the model barrel, which also
// re-exports mappers that depend on server-only query modules.
import {
  buildSlideLabel,
  toNextSlideIndex,
  toPreviousSlideIndex,
  toSlideIndexForKey,
} from '../model/carousel-state';
import type { FeaturedSlide } from '../model/featured-slide';

type FeaturedProjectsCarouselProps = { slides: FeaturedSlide[] };

// Slide width and gap shared by the track padding (no JS) and the transform (JS).
const TRACK_STYLE = {
  '--slide-w': 'min(calc(100% - 2.5rem), 40rem)',
  '--slide-gap': '1.5rem',
} as CSSProperties;

function buildTrackTransform(index: number): string {
  return `translateX(calc(50% - var(--slide-w) / 2 - ${index} * (var(--slide-w) + var(--slide-gap))))`;
}

/**
 * Featured-projects carousel (architecture D3): buttons, dots and arrow keys, no autoplay.
 * Without JavaScript the server HTML is a horizontally scrollable row: the first project is
 * centred and every project's link stays reachable. Once hydrated it becomes a carousel where
 * only the current slide is exposed; its neighbours are dimmed and inert.
 */
export function FeaturedProjectsCarousel({ slides }: FeaturedProjectsCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isEnhanced, setIsEnhanced] = useState(false);
  const headingId = useId();
  const count = slides.length;
  const hasControls = isEnhanced && count > 1;

  useEffect(() => {
    setIsEnhanced(true);
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!hasControls) {
      return;
    }
    const next = toSlideIndexForKey(event.key, current, count);
    if (next !== null) {
      event.preventDefault();
      setCurrent(next);
    }
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-labelledby={headingId}
      onKeyDown={handleKeyDown}
      className="relative mt-10 md:mt-12"
    >
      <h2 id={headingId} className="sr-only">
        Featured projects
      </h2>
      <Container className="flex h-12 justify-end gap-3">
        {hasControls ? (
          <>
            <CarouselButton
              label="Previous project"
              onClick={() => setCurrent(toPreviousSlideIndex(current, count))}
            >
              <ArrowLeft aria-hidden="true" size={20} />
            </CarouselButton>
            <CarouselButton
              label="Next project"
              onClick={() => setCurrent(toNextSlideIndex(current, count))}
            >
              <ArrowRight aria-hidden="true" size={20} />
            </CarouselButton>
          </>
        ) : null}
      </Container>

      <div className="mt-6 overflow-hidden py-6">
        <div
          aria-live={isEnhanced ? 'polite' : undefined}
          style={
            isEnhanced
              ? { ...TRACK_STYLE, transform: buildTrackTransform(current) }
              : { ...TRACK_STYLE, paddingInline: 'calc(50% - var(--slide-w) / 2)' }
          }
          className={
            isEnhanced
              ? 'flex gap-(--slide-gap) transition-transform duration-500 ease-out motion-reduce:transition-none'
              : 'flex snap-x snap-mandatory gap-(--slide-gap) overflow-x-auto'
          }
        >
          {slides.map((slide, index) => {
            const isCurrent = !isEnhanced || index === current;
            return (
              // biome-ignore lint/a11y/useSemanticElements: WAI-ARIA APG carousel slides are role="group" with aria-roledescription="slide"; <fieldset> is a form control grouping.
              <div
                key={slide.slug}
                role="group"
                aria-roledescription="slide"
                aria-label={buildSlideLabel(index, count)}
                aria-hidden={isCurrent ? undefined : true}
                inert={!isCurrent}
                className={`w-(--slide-w) shrink-0 snap-center transition duration-500 motion-reduce:transition-none ${
                  isEnhanced && !isCurrent ? 'scale-[0.85] opacity-30' : ''
                }`}
              >
                <ProjectSlide slide={slide} />
              </div>
            );
          })}
        </div>
      </div>

      {hasControls ? (
        <ul className="mt-6 flex justify-center gap-1">
          {slides.map((slide, index) => (
            <li key={slide.slug}>
              <button
                type="button"
                aria-label={`Show project ${index + 1}`}
                aria-current={index === current ? 'true' : undefined}
                onClick={() => setCurrent(index)}
                className="group grid h-6 place-items-center px-1"
              >
                <span
                  aria-hidden="true"
                  className={`block h-2 rounded-full transition-all duration-150 ${
                    index === current
                      ? 'w-8 bg-foreground'
                      : 'w-2 bg-muted-foreground/50 group-hover:bg-muted-foreground'
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

type CarouselButtonProps = { label: string; onClick: () => void; children: ReactNode };

/** icon-button (DESIGN.md): 48px circle, border at 60%, muted icon that lights up on hover. */
function CarouselButton({ label, onClick, children }: CarouselButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-12 place-items-center rounded-full border border-border/60 bg-background text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground"
    >
      {children}
    </button>
  );
}

/** project-slide (DESIGN.md): cover 45% + gradient panel with tags, title, summary, link. */
function ProjectSlide({ slide }: { slide: FeaturedSlide }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-slide bg-linear-to-br from-slide-panel-from to-slide-panel-to text-pill shadow-slide md:min-h-75 md:flex-row">
      <div className="relative aspect-video md:aspect-auto md:w-[45%]">
        <Image
          src={slide.cover.src}
          alt={slide.cover.alt}
          fill={true}
          sizes="(min-width: 768px) 18rem, 90vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-3 p-8">
        {slide.tags.length > 0 ? (
          <ul
            aria-label="Tags"
            className="flex flex-wrap gap-x-2 text-xs tracking-meta text-slide-meta uppercase"
          >
            {slide.tags.map((tag, index) => (
              <li key={tag}>
                {index > 0 ? <span aria-hidden="true">• </span> : null}
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
        <h3 className="font-mono text-2xl leading-tight md:text-[2rem]">{slide.title}</h3>
        <p className="line-clamp-2 text-sm text-slide-body">{slide.summary}</p>
        <ArrowPillLink href={slide.href} srSuffix={`about ${slide.title}`} className="mt-2">
          Read more
        </ArrowPillLink>
      </div>
    </article>
  );
}
