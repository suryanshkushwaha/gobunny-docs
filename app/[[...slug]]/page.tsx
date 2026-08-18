import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { DocsEntryList } from '@/components/docs/docs-entry-list';
import { DocsHero } from '@/components/docs/docs-home';
import { DocsPageHeader } from '@/components/docs/docs-page-header';
import { DocsPager } from '@/components/docs/docs-pager';
import { DocsShell } from '@/components/docs/docs-shell';
import { DocsTocMobile } from '@/components/docs/docs-toc';
import {
  getAllRoutes,
  getBreadcrumbs,
  getPage,
  getPager,
  getSection,
  getSectionPages,
  loadPageContent,
} from '@/lib/docs/content';

type Params = { slug?: string[] };

// All 45 routes are known at build time: 37 pages plus 8 section landing pages.
export function generateStaticParams(): Params[] {
  return getAllRoutes().map((route) => ({
    slug: route === '/' ? [] : route.slice(1).split('/'),
  }));
}

export const dynamicParams = false;

function routeFor(slug: string[] | undefined): string {
  return `/${(slug ?? []).join('/')}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const route = routeFor((await params).slug);

  const page = getPage(route);
  if (page) {
    return {
      title: route === '/' ? 'GoBunny Docs' : page.title,
      description: page.description,
    };
  }

  const section = getSection(route.slice(1));
  if (section) {
    return { title: section.label, description: section.description };
  }

  return {};
}

export default async function DocPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const route = routeFor((await params).slug);

  const page = getPage(route);
  if (page) {
    const mdxModule = await loadPageContent(route);
    if (!mdxModule) notFound();
    const MDXContent = mdxModule.default;
    const { prev, next } = getPager(route);
    const isHome = route === '/';

    return (
      <DocsShell crumbs={getBreadcrumbs(route)} headings={page.headings}>
        {isHome ? (
          <DocsHero title={page.title} description={page.description} />
        ) : (
          <>
            {/* The frontmatter description is deliberately not repeated here:
                it is the first paragraph of the body, which renders just below. */}
            <DocsPageHeader
              title={page.title}
              readingMinutes={page.readingMinutes}
              section={
                page.sectionSlug ? getSection(page.sectionSlug) : undefined
              }
            />
            <DocsTocMobile headings={page.headings} />
          </>
        )}
        <MDXContent />
        <DocsPager prev={prev} next={next} />
      </DocsShell>
    );
  }

  const section = getSection(route.slice(1));
  if (!section) notFound();

  const pages = getSectionPages(section.slug);
  const { prev, next } = getPager(route);

  return (
    <DocsShell crumbs={getBreadcrumbs(route)} headings={[]}>
      <header className='pb-2'>
        <p className='font-mono text-xs tracking-wide text-muted-foreground uppercase'>
          Section
        </p>
        <h1 className='mt-2 text-2xl font-semibold tracking-tight text-balance text-foreground'>
          {section.label}
        </h1>
        <p className='mt-4 max-w-[68ch] text-sm leading-6 text-muted-foreground'>
          {section.description}
        </p>
        <p className='mt-4 font-mono text-xs text-muted-foreground'>
          {pages.length} {pages.length === 1 ? 'page' : 'pages'} ·{' '}
          {pages.reduce((total, child) => total + child.readingMinutes, 0)} min
          total
        </p>
      </header>

      <DocsEntryList pages={pages} sectionLabel={section.label} />

      <DocsPager prev={prev} next={next} />
    </DocsShell>
  );
}
