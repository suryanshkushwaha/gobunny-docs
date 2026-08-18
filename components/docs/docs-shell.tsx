import { ThemeSwitcher } from '@/components/theme-switcher';
import { DocsBreadcrumb } from '@/components/docs/docs-breadcrumb';
import { DocsSearch, type QuickLink } from '@/components/docs/docs-search';
import { DocsToc } from '@/components/docs/docs-toc';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { getSections, getTopLevelPages, type Crumb } from '@/lib/docs/content';
import type { DocHeading } from '@/lib/docs/types';

/**
 * The per-page half of the frame: header, reading column, table of contents.
 *
 * The SidebarProvider and the sidebar itself deliberately live in
 * app/layout.tsx instead — see the comment there. Everything below re-renders
 * on navigation, which is fine because none of it holds scroll state.
 *
 * Header dimensions: px-4 py-1.5 on a phone (≈45px) and h-14 from md up
 * (56px).
 */
export function DocsShell({
  crumbs,
  headings,
  children,
}: {
  crumbs: Crumb[];
  headings: DocHeading[];
  children: React.ReactNode;
}) {
  const sections = getSections();
  const topLevel = getTopLevelPages();

  // Shown in the search dialog before anything is typed. Doubles as the other
  // route to the section landing pages, which the sidebar deliberately omits.
  const quickLinks: QuickLink[] = [
    ...topLevel.map((page) => ({
      href: page.route,
      label: page.sidebarLabel,
      hint: 'Guide',
    })),
    ...sections.map((section) => ({
      href: section.route,
      label: section.label,
      hint: `${section.pages.length} pages`,
    })),
  ];

  return (
    /* min-w-0 so wide tables scroll inside themselves rather than the page */
    <SidebarInset className='min-w-0'>
      <header className='sticky top-0 z-40 flex shrink-0 items-center gap-3 border-b bg-background px-4 py-1.5 md:h-14 md:py-0'>
        <SidebarTrigger className='relative -ml-1 size-8 after:absolute after:-inset-1.5 md:size-7 md:after:inset-0' />

        <DocsBreadcrumb crumbs={crumbs} />

        <div className='ml-auto flex shrink-0 items-center gap-2'>
          <DocsSearch quickLinks={quickLinks} />
          <ThemeSwitcher
            fixed={false}
            className='relative size-8 after:absolute after:-inset-1.5 md:after:inset-0'
          />
        </div>
      </header>

      {/* SidebarInset already renders the <main> landmark, so this is a div. */}
      <div className='mx-auto flex w-full max-w-6xl gap-8 px-4 md:px-6 lg:px-8'>
        <article className='min-w-0 flex-1 py-8'>{children}</article>
        <DocsToc headings={headings} />
      </div>
    </SidebarInset>
  );
}
