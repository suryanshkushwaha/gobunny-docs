import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';
import { DocsSidebar } from '@/components/docs/docs-sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { getSectionPages, getSections, getTopLevelPages } from '@/lib/docs/content';
import type { DocPage } from '@/lib/docs/types';
import { cn } from '@/lib/utils';

// Geist Sans for text, Geist Mono for code. The variable names and the 16px
// root size are unchanged, so every token and size still lines up.
const fontSans = Geist({ subsets: ['latin'], variable: '--font-sans' });
const fontMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: {
    default: 'GoBunny Docs',
    template: '%s · GoBunny Docs',
  },
  description: 'Step-by-step help for every screen in GoBunny.',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const sections = getSections();
  const topLevel = getTopLevelPages();
  const sectionPages: Record<string, DocPage[]> = Object.fromEntries(
    sections.map((section) => [section.slug, getSectionPages(section.slug)]),
  );

  return (
    <html
      lang='en'
      suppressHydrationWarning
      className={cn(
        'antialiased',
        fontMono.variable,
        'font-sans',
        fontSans.variable,
      )}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            {/*
              The sidebar lives in the root layout, not in the page.
              Next never remounts the root layout on navigation, so the nav's
              scroll container keeps its scrollTop when you click through to
              another page. Rendering it per-page remounted that container and
              snapped the sidebar back to the top on every click.
            */}
            <SidebarProvider>
              <DocsSidebar
                topLevel={topLevel}
                sections={sections}
                sectionPages={sectionPages}
              />
              {children}
            </SidebarProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
