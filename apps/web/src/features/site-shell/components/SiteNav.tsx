'use client';

import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { type KeyboardEvent, useId, useRef, useState } from 'react';
import { useLocationHash } from '../hooks';
import { findCurrentNavItem, SITE_NAV_ITEMS } from '../model';

/**
 * Main navigation. From md up the links sit inline; below md they collapse behind a menu
 * button into a panel under the header (`background` at 95% with blur, DESIGN.md › Colors).
 */
export function SiteNav() {
  const pathname = usePathname();
  const hash = useLocationHash();
  const current = findCurrentNavItem(pathname, hash);
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape' && isOpen) {
      setIsOpen(false);
      menuButtonRef.current?.focus();
    }
  }

  return (
    <nav aria-label="Main" onKeyDown={handleKeyDown}>
      <button
        ref={menuButtonRef}
        type="button"
        aria-label="Menu"
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
        className="-mr-2 grid size-10 place-items-center rounded-full text-foreground hover:bg-secondary/60 md:hidden"
      >
        {isOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
      </button>
      <ul
        id={listId}
        className={`${isOpen ? 'flex' : 'hidden'} absolute inset-x-0 top-full z-40 flex-col gap-1 border-b border-border/30 bg-background/95 px-4 py-4 backdrop-blur md:static md:flex md:flex-row md:gap-8 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none`}
      >
        {SITE_NAV_ITEMS.map((item) => (
          <li key={item.id}>
            <a
              href={item.href}
              aria-current={current?.id === item.id ? current.ariaCurrent : undefined}
              onClick={() => setIsOpen(false)}
              className="block py-3 font-mono text-base text-muted-foreground transition-colors duration-150 hover:text-foreground aria-[current]:text-foreground md:py-0 md:text-sm"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
