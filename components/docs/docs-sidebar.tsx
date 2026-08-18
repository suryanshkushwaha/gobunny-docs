'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import type { DocPage, DocSectionNode } from '@/lib/docs/types';
import { NavIcon } from '@/lib/docs/nav-icons';

/**
 * An h-14 brand header with an avatar badge, then labelled groups of
 * icon-bearing menu items. Hover and active stay on the neutral
 * bg-sidebar-accent — never a brand tint.
 *
 * Group labels are plain text. The eight section landing pages are reached
 * from the breadcrumb instead.
 */
export function DocsSidebar({
  topLevel,
  sections,
  sectionPages,
}: {
  topLevel: DocPage[];
  sections: DocSectionNode[];
  sectionPages: Record<string, DocPage[]>;
}) {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();

  // On a phone the sidebar is a sheet over the page, so it has to get out of
  // the way once you have picked something.
  const dismissOnMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  const renderItem = (page: DocPage) => (
    <SidebarMenuItem key={page.route}>
      <SidebarMenuButton
        isActive={pathname === page.route}
        tooltip={page.sidebarLabel}
        className='cursor-pointer'
        render={<Link href={page.route} onClick={dismissOnMobile} />}
      >
        <NavIcon route={page.route} />
        <span>{page.sidebarLabel}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='hidden h-14 shrink-0 justify-center border-b md:flex'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size='lg'
              tooltip='GoBunny Docs'
              className='cursor-pointer'
              render={<Link href='/' onClick={dismissOnMobile} />}
            >
              <Avatar size='default'>
                <AvatarFallback className='bg-sidebar-primary text-sidebar-primary-foreground'>
                  G
                </AvatarFallback>
              </Avatar>
              <span className='truncate font-medium'>GoBunny Docs</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className='gap-1'>{topLevel.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {sections.map((section) => (
          <SidebarGroup key={section.slug}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className='gap-1'>
                {(sectionPages[section.slug] ?? []).map(renderItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
