type CircleAccentProps = { className?: string };

/** Decorative 1px ring in `border` at 30% (DESIGN.md › Elevation & Depth); position and size via className. */
export function CircleAccent({ className }: CircleAccentProps) {
  return (
    <div
      aria-hidden="true"
      className={['pointer-events-none absolute rounded-full border border-border/30', className]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
