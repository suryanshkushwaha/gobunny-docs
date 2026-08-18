import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { DocPage } from '@/lib/docs/types';

/**
 * A post-list layout: a 12-column grid with a
 * monospace metadata rail, the title and excerpt, and a right-aligned
 * "Read →".
 *
 * Where a post list would carry a date, a docs page has none, so the rail
 * carries the page's position in the section instead — the more useful
 * fact when the pages are written to be read in order.
 */
export function DocsEntryList({
  pages,
  sectionLabel,
}: {
  pages: DocPage[];
  sectionLabel?: string;
}) {
  return (
    <div>
      {pages.map((page, index) => (
        <Link
          key={page.route}
          href={page.route}
          className='group grid gap-4 border-b border-border py-8 no-underline outline-none transition-colors last:border-b-0 focus-visible:ring-2 focus-visible:ring-ring md:grid-cols-12 md:gap-8'
        >
          <div className='flex flex-wrap items-center gap-3 md:col-span-3 md:block'>
            <p className='font-mono text-xs text-muted-foreground'>
              {String(index + 1).padStart(2, '0')} / {String(pages.length).padStart(2, '0')}
            </p>
            <p className='inline-flex items-center gap-2 font-mono text-xs text-muted-foreground md:mt-3'>
              <Clock aria-hidden='true' className='size-3.5' />
              {page.readingMinutes} min read
            </p>
          </div>

          <div className='md:col-span-7'>
            <h2 className='text-2xl font-semibold tracking-tight text-balance transition-colors group-hover:text-docs-accent-text'>
              {page.title}
            </h2>
            <p className='mt-4 text-sm leading-6 text-muted-foreground'>
              {page.description}
            </p>
            {sectionLabel ? (
              <div className='mt-4 flex flex-wrap gap-2'>
                <Tag>{sectionLabel}</Tag>
              </div>
            ) : null}
          </div>

          <span className='inline-flex items-center gap-2 text-sm font-medium text-foreground md:col-span-2 md:justify-self-end'>
            Read
            <ArrowRight
              aria-hidden='true'
              className='size-4 transition-transform group-hover:translate-x-0.5'
            />
          </span>
        </Link>
      ))}
    </div>
  );
}

/** The blog's tag pill, token-for-token on GoBunny's palette. */
export function Tag({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground',
        className,
      )}
    >
      {children}
    </span>
  );
}
