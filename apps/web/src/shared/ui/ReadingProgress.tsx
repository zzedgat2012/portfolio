'use client';

import { useEffect, useRef } from 'react';
import { toScrollProgress } from '@/shared/lib';

/**
 * Reading-progress bar of the article and project pages (DESIGN.md › Movimento): 2px, fixed to the
 * top of the viewport, accent→primary, scaled to the fraction of the document scrolled. Decorative:
 * `aria-hidden`, never focusable, transparent to clicks and hidden in print. The scale is written
 * straight to the element (no React state) at most once per frame, from passive listeners.
 */
export function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (bar === null) {
      return;
    }
    let frame: number | null = null;

    function update() {
      frame = null;
      const root = document.documentElement;
      const progress = toScrollProgress(root.scrollTop, root.scrollHeight, root.clientHeight);
      bar?.style.setProperty('transform', `scaleX(${progress})`);
    }

    function handleScrollOrResize() {
      if (frame === null) {
        frame = requestAnimationFrame(update);
      }
    }

    update();
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      data-testid="reading-progress"
      style={{ transform: 'scaleX(0)' }}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-linear-to-r from-accent to-primary transition-transform duration-150 ease-standard motion-reduce:transition-none print:hidden"
    />
  );
}
