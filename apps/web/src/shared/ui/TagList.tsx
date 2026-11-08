type TagListProps = {
  /** Tag names, in display order. */
  tags: string[];
  /** Accessible name of the list. */
  label?: string;
  className?: string;
};

/** Project tags as pills (DESIGN.md › Components › project-tag): Fira 12px, border at 30%. */
export function TagList({ tags, label = 'Tags', className }: TagListProps) {
  if (tags.length === 0) {
    return null;
  }
  return (
    <ul
      aria-label={label}
      className={['flex flex-wrap gap-2', className].filter(Boolean).join(' ')}
    >
      {tags.map((tag) => (
        <li
          key={tag}
          className="rounded-full border border-border/30 bg-secondary px-4 py-2 font-mono text-xs text-foreground"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}
