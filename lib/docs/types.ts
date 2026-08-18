import type { ComponentType } from 'react';

export type DocHeading = {
  depth: number;
  text: string;
  id: string;
};

export type DocPage = {
  route: string;
  slug: string[];
  title: string;
  description: string;
  order: number;
  sidebarLabel: string;
  sectionSlug: string | null;
  headings: DocHeading[];
  /** Estimated reading time in minutes, at 200 wpm. */
  readingMinutes: number;
};

export type DocSectionNode = {
  slug: string;
  label: string;
  order: number;
  description: string;
  route: string;
  /** Routes of the pages in this section, in sidebar order. */
  pages: string[];
};

export type DocManifest = {
  pages: DocPage[];
  topLevel: string[];
  sections: DocSectionNode[];
  /** Flat order used for the prev/next footer. */
  readingOrder: string[];
};

export type MDXModule = {
  default: ComponentType<Record<string, unknown>>;
};

/** One page in the client-side search corpus. */
export type SearchPage = {
  /** route */ r: string;
  /** title */ t: string;
  /** description */ d: string;
  /** section label */ s: string;
  /** chunks */ c: SearchChunk[];
};

export type SearchChunk = {
  /** heading id */ i: string;
  /** heading text */ h: string;
  /** body text */ x: string;
};

export type SearchIndex = { pages: SearchPage[] };
