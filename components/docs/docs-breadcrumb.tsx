import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import type { Crumb } from '@/lib/docs/content';

/**
 * This is also how the eight section landing pages are reached.
 */
export function DocsBreadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav
      aria-label='Breadcrumb'
      className='flex min-w-0 flex-1 items-center gap-1.5 text-sm'
    >
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <div key={crumb.href} className='flex min-w-0 items-center gap-1.5'>
            {index > 0 && (
              <ChevronRight
                aria-hidden='true'
                className='size-3.5 shrink-0 text-muted-foreground'
              />
            )}
            {isLast ? (
              <span
                aria-current='page'
                className='truncate px-1.5 py-1 font-medium'
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className='truncate rounded-md px-1.5 py-1 text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring'
              >
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
