'use client';

import * as React from 'react';
import { ChevronDown, List } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { DocHeading } from '@/lib/docs/types';

/**
 * The phone equivalent of the sidebar TOC. Front-desk staff read this on a
 * handset, where the right-hand column does not exist — a collapsed <details>
 * keeps the outline one tap away without costing any vertical space.
 */
export function DocsTocMobile({ headings }: { headings: DocHeading[] }) {
  if (headings.length < 2) return null;

  return (
    <details className='group mb-6 rounded-lg border border-border bg-card xl:hidden'>
      <summary className='flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground marker:hidden'>
        <List aria-hidden='true' className='size-3.5' />
        On this page
        <ChevronDown
          aria-hidden='true'
          className='ml-auto size-3.5 transition-transform group-open:rotate-180'
        />
      </summary>
      <ul className='flex flex-col border-t border-border px-1 py-1'>
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                'block rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                heading.depth === 3 && 'pl-6',
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

/**
 * "On this page" — h2 and h3 only, with scroll-spy. Hidden below xl so the
 * reading column keeps its full width on laptops and phones.
 */
export function DocsToc({ headings }: { headings: DocHeading[] }) {
  const [activeId, setActiveId] = React.useState<string>('');

  React.useEffect(() => {
    if (!headings.length) return;

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null);

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length) {
          setActiveId(visible[0].target.id);
          return;
        }

        // Nothing in the band — fall back to the last heading scrolled past, so
        // the marker never blanks out mid-section.
        const above = elements.filter(
          (element) => element.getBoundingClientRect().top < 100,
        );
        if (above.length) setActiveId(above[above.length - 1].id);
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <aside className='sticky top-14 hidden h-[calc(100svh-3.5rem)] w-56 shrink-0 overflow-y-auto py-8 pl-2 xl:block'>
      <p className='mb-2 px-2 text-xs font-medium text-muted-foreground'>
        On this page
      </p>
      <ul className='flex flex-col gap-0.5 border-l border-border'>
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={cn(
                '-ml-px block border-l py-1 text-xs leading-5 transition-colors',
                heading.depth === 3 ? 'pl-6' : 'pl-3',
                activeId === heading.id
                  ? 'border-primary font-medium text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
