import { manifest } from './manifest.generated';
import { registry } from './registry.generated';
import type { DocPage, DocSectionNode } from './types';

const pageByRoute = new Map(manifest.pages.map((page) => [page.route, page]));
const sectionBySlug = new Map(
  manifest.sections.map((section) => [section.slug, section]),
);

export function getPage(route: string): DocPage | undefined {
  return pageByRoute.get(route);
}

export function getSection(slug: string): DocSectionNode | undefined {
  return sectionBySlug.get(slug);
}

export function getSections(): DocSectionNode[] {
  return manifest.sections;
}

/** Top-level pages (Introduction, Getting started) shown above the groups. */
export function getTopLevelPages(): DocPage[] {
  return manifest.topLevel.map((route) => pageByRoute.get(route)!);
}

export function getSectionPages(slug: string): DocPage[] {
  return (sectionBySlug.get(slug)?.pages ?? []).map(
    (route) => pageByRoute.get(route)!,
  );
}

/** Every route the site serves: 37 pages + 8 section landing pages. */
export function getAllRoutes(): string[] {
  return [
    ...manifest.pages.map((page) => page.route),
    ...manifest.sections.map((section) => section.route),
  ];
}

export function loadPageContent(route: string) {
  return registry[route]?.();
}

export type Crumb = { label: string; href: string };

export function getBreadcrumbs(route: string): Crumb[] {
  const crumbs: Crumb[] = [{ label: 'Docs', href: '/' }];
  if (route === '/') return crumbs;

  const [first] = route.slice(1).split('/');
  const section = sectionBySlug.get(first);
  if (section) {
    crumbs.push({ label: section.label, href: section.route });
  }

  const page = pageByRoute.get(route);
  if (page) {
    crumbs.push({ label: page.title, href: page.route });
  } else if (section && section.route === route) {
    // Section landing page — the section crumb above is already the leaf.
  }

  return crumbs;
}

export type PagerLink = { title: string; href: string } | null;

/** Previous / next in flat reading order, for the page footer. */
export function getPager(route: string): { prev: PagerLink; next: PagerLink } {
  const order = manifest.readingOrder;
  const index = order.indexOf(route);
  if (index === -1) return { prev: null, next: null };

  const toLink = (target: string | undefined): PagerLink => {
    if (!target) return null;
    const page = pageByRoute.get(target);
    if (page) return { title: page.title, href: page.route };
    const section = manifest.sections.find((s) => s.route === target);
    return section ? { title: section.label, href: section.route } : null;
  };

  return { prev: toLink(order[index - 1]), next: toLink(order[index + 1]) };
}
