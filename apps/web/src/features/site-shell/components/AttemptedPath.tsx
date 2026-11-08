'use client';

import { Search } from 'lucide-react';
import { useSyncExternalStore } from 'react';

function subscribe(): () => void {
  return () => {};
}

/** The URL the visitor asked for; Cloudflare serves 404.html without changing it. */
export function AttemptedPath() {
  const path = useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
    () => '',
  );
  if (!path) {
    return null;
  }

  return (
    <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-border/60 bg-secondary/60 px-4 py-2 font-mono text-xs">
      <Search aria-hidden="true" size={12} className="shrink-0 text-muted-foreground" />
      <span className="shrink-0 text-muted-foreground">Attempted path:</span>
      <span className="truncate text-foreground">{path}</span>
    </p>
  );
}
