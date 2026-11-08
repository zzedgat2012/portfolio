'use client';

import { type ReactNode, useEffect, useState } from 'react';

type CopyButtonProps = {
  /** Text written to the clipboard. */
  text: string;
  /** Visible label (and accessible name) before copying. */
  children: ReactNode;
  className?: string;
};

const COPIED_LABEL = 'Copied';
const COPIED_RESET_MS = 2000;

/**
 * Copies `text` to the clipboard and shows "Copied" for two seconds (D3: the article page's only
 * client component). The label is a polite live region, so the change is announced.
 */
export function CopyButton({ text, children, className }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  // Disabled in the static HTML until hydration attaches the click handler.
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => setIsHydrated(true), []);

  useEffect(() => {
    if (!isCopied) {
      return;
    }
    const timer = setTimeout(() => setIsCopied(false), COPIED_RESET_MS);
    return () => clearTimeout(timer);
  }, [isCopied]);

  function handleClick() {
    navigator.clipboard.writeText(text).then(
      () => setIsCopied(true),
      () => setIsCopied(false),
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isHydrated}
      className={['disabled:cursor-default disabled:opacity-60', className]
        .filter(Boolean)
        .join(' ')}
    >
      <span aria-live="polite">{isCopied ? COPIED_LABEL : children}</span>
    </button>
  );
}
