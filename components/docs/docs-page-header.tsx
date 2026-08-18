import Link from 'next/link';
import { Clock } from 'lucide-react';

import { Tag } from '@/components/docs/docs-entry-list';
import { SectionIcon } from '@/lib/docs/nav-icons';
import type { DocSectionNode } from '@/lib/docs/types';

/**
 * Page title plus a metadata line. Where a post list would carry a date and a
 * read time in `font-mono text-xs text-muted-foreground`, a docs page has no
 * date, so the section stands in — rendered as a tag pill and linked back to
 * the section index.
 */
export function DocsPageHeader({
  title,
  readingMinutes,
  section,
}: {
  title: string;
  readingMinutes: number;
  section?: DocSectionNode;
}) {
  return (
    <header className='mb-8'>
      <h1 className='text-2xl font-semibold tracking-tight text-balance text-foreground'>
        {title}
      </h1>

      <div className='mt-4 flex flex-wrap items-center gap-3'>
        {section ? (
          <Link
            href={section.route}
            className='no-underline outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            <Tag className='transition-colors hover:border-docs-accent-text/40'>
              <SectionIcon
                slug={section.slug}
                className='size-3.5 text-docs-accent-text'
              />
              {section.label}
            </Tag>
          </Link>
        ) : null}

        <span className='inline-flex items-center gap-2 font-mono text-xs text-muted-foreground'>
          <Clock aria-hidden='true' className='size-3.5' />
          {readingMinutes} min read
        </span>
      </div>
    </header>
  );
}
