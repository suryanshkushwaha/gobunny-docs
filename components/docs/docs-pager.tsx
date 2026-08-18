import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { PagerLink } from '@/lib/docs/content';

/** Previous / next in reading order, at the foot of every page. */
export function DocsPager({
  prev,
  next,
}: {
  prev: PagerLink;
  next: PagerLink;
}) {
  if (!prev && !next) return null;

  return (
    <nav
      aria-label='Page navigation'
      className='mt-14 grid gap-3 border-t border-border pt-6 sm:grid-cols-2'
    >
      {prev ? (
        <Link
          href={prev.href}
          className='group flex flex-col gap-1 rounded-lg border border-border p-3 transition-colors outline-none hover:border-docs-accent-text/40 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring'
        >
          <span className='flex items-center gap-1 text-xs text-muted-foreground'>
            <ChevronLeft
              aria-hidden='true'
              className='size-3 transition-transform group-hover:-translate-x-0.5'
            />
            Previous
          </span>
          <span className='truncate text-sm font-medium'>{prev.title}</span>
        </Link>
      ) : (
        <span aria-hidden='true' />
      )}
      {next ? (
        <Link
          href={next.href}
          className='group flex flex-col items-end gap-1 rounded-lg border border-border p-3 text-right transition-colors outline-none hover:border-docs-accent-text/40 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring sm:col-start-2'
        >
          <span className='flex items-center gap-1 text-xs text-muted-foreground'>
            Next
            <ChevronRight
              aria-hidden='true'
              className='size-3 transition-transform group-hover:translate-x-0.5'
            />
          </span>
          <span className='truncate text-sm font-medium'>{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}
