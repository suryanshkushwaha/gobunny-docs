import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Compass } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getSectionPages, getSections } from '@/lib/docs/content';
import { SectionIcon } from '@/lib/docs/nav-icons';

/** The landing page hero. Rendered by the route, above the MDX body. */
export function DocsHero({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className='pb-2'>
      <p className='font-mono text-xs tracking-wide text-muted-foreground uppercase'>
        Documentation
      </p>
      <h1 className='mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-3xl'>
        {title}
      </h1>
      <p className='mt-4 max-w-[60ch] text-sm leading-6 text-muted-foreground'>
        {description}
      </p>

      <div className='mt-6 flex flex-wrap items-center gap-2'>
        <Button render={<Link href='/getting-started' />}>
          Get started
          <ArrowRight data-icon='inline-end' />
        </Button>
        <Button variant='outline' render={<Link href='/dashboard/navigation' />}>
          <Compass data-icon='inline-start' />
          Find your way around
        </Button>
      </div>
    </section>
  );
}

/**
 * The whole guide at a glance, built from the content manifest.
 *
 * Exposed as an MDX component rather than hard-wired into the route, so the
 * landing page can place it exactly where it reads best — after the two
 * paragraphs that explain what GoBunny is, before the detailed index. Adding a
 * section to lib/docs/sections.ts adds a card here automatically.
 */
export function SectionGrid() {
  const sections = getSections().map((section) => ({
    ...section,
    minutes: getSectionPages(section.slug).reduce(
      (total, page) => total + page.readingMinutes,
      0,
    ),
  }));
  const totalPages = sections.reduce(
    (count, section) => count + section.pages.length,
    0,
  );

  return (
    <section className='my-8 border-t border-border pt-8'>
      <div className='mb-4 flex items-baseline justify-between gap-3'>
        <h2 className='font-mono text-xs tracking-wide text-muted-foreground uppercase'>
          Browse by section
        </h2>
        <span className='font-mono text-xs text-muted-foreground'>
          {totalPages} pages
        </span>
      </div>

      <div className='grid gap-3 sm:grid-cols-2'>
        {sections.map((section) => (
          <Link
            key={section.slug}
            href={section.route}
            className='group rounded-lg border border-border bg-card p-4 transition-colors outline-none hover:border-docs-accent-text/40 hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring'
          >
            <div className='flex items-center gap-2'>
              <span className='flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary'>
                <SectionIcon slug={section.slug} className='size-4' />
              </span>
              <span className='min-w-0 flex-1 truncate text-sm font-medium'>
                {section.label}
              </span>
              <ArrowUpRight
                aria-hidden='true'
                className='size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100'
              />
            </div>
            <p className='mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground'>
              {section.description}
            </p>
            <p className='mt-3 font-mono text-xs text-muted-foreground'>
              {section.pages.length}{' '}
              {section.pages.length === 1 ? 'page' : 'pages'} · {section.minutes}{' '}
              min
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
